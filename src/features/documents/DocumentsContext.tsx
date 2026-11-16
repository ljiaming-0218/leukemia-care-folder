import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { xiaoludengRule } from "../../data/policies/xiaoludeng";
import {
  archiveTypes,
  computeFlags,
  createEmptyFields,
  type ArchiveType,
  type DocFlag,
  type FieldKey,
  type LocalDocument,
} from "../../domain/documents";
import { canRecognize, disposeRecognition, extractDocument } from "../../document/extract";
import { mergeParsedFields, parsePages } from "../../document/parse";
import { sha256File } from "../../document/sha256";
import { cancelOcr } from "../../document/ocr";
import { useWorkspace, type WorkspaceMode } from "../workspace/WorkspaceContext";

export const MAX_BATCH_FILES = 20;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

type AddFilesResult = { added: number; rejected: string[] };

type DocumentsContextValue = {
  docs: LocalDocument[];
  flags: Record<string, DocFlag[]>;
  isRunning: boolean;
  runningId: string | null;
  addFiles: (files: File[] | FileList) => Promise<AddFilesResult>;
  updateArchiveType: (id: string, archiveType: ArchiveType) => void;
  updateField: (id: string, key: FieldKey, value: string) => void;
  setConfirmed: (id: string, confirmed: boolean) => void;
  dismissFlag: (id: string, key: string) => void;
  removeDoc: (id: string) => void;
  clearAll: () => void;
  startRecognition: (ids?: string[]) => void;
  cancelRecognition: () => void;
  loadDemoDocuments: (next: LocalDocument[]) => void;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

function normalizeMime(file: File): string {
  if (file.type) return file.type.toLowerCase();
  if (/\.pdf$/i.test(file.name)) return "application/pdf";
  if (/\.jpe?g$/i.test(file.name)) return "image/jpeg";
  if (/\.png$/i.test(file.name)) return "image/png";
  return "";
}

function previewKindFor(file: File, mime: string): LocalDocument["previewKind"] {
  if (/heic|heif/i.test(mime) || /\.(heic|heif)$/i.test(file.name)) return "none";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "none";
}

function acceptedName(file: File, mime: string): boolean {
  if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png") {
    return true;
  }
  if (/\.(ofd|heic|heif)$/i.test(file.name)) return true;
  return false;
}

function isSupportedArchiveType(value: string): value is ArchiveType {
  return (archiveTypes as readonly string[]).includes(value);
}

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const [docsByMode, setDocsByMode] = useState<Record<WorkspaceMode, LocalDocument[]>>({
    real: [],
    demo: [],
  });
  const [isRunning, setIsRunning] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const docsRef = useRef<Record<WorkspaceMode, LocalDocument[]>>({ real: [], demo: [] });
  const queueRef = useRef<{ id: string; file: File; mode: WorkspaceMode }[]>([]);
  const runningRef = useRef(false);
  const abortRef = useRef(false);

  const docs = docsByMode[mode];

  const setDocsFor = useCallback(
    (target: WorkspaceMode, update: (previous: LocalDocument[]) => LocalDocument[]) => {
      const next = update(docsRef.current[target]);
      docsRef.current = { ...docsRef.current, [target]: next };
      setDocsByMode((previous) => ({ ...previous, [target]: next }));
    },
    [],
  );

  const setDocs = useCallback(
    (update: (previous: LocalDocument[]) => LocalDocument[]) => setDocsFor(mode, update),
    [mode, setDocsFor],
  );

  const patch = useCallback(
    (
      id: string,
      update: Partial<LocalDocument> | ((doc: LocalDocument) => Partial<LocalDocument>),
      target: WorkspaceMode = mode,
    ) => {
      setDocsFor(target, (previous) =>
        previous.map((doc) =>
          doc.id === id
            ? { ...doc, ...(typeof update === "function" ? update(doc) : update) }
            : doc,
        ),
      );
    },
    [mode, setDocsFor],
  );

  const runQueue = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    abortRef.current = false;
    setIsRunning(true);
    while (queueRef.current.length) {
      if (abortRef.current) {
        queueRef.current.splice(0).forEach(({ id, mode: target }) =>
          patch(id, { ocrState: "已取消", progress: 0, progressLabel: "" }, target),
        );
        break;
      }
      const item = queueRef.current.shift();
      if (!item) break;
      setRunningId(item.id);
      patch(item.id, {
        ocrState: "识别中",
        progress: 0.02,
        progressLabel: "准备原件副本",
        error: undefined,
      }, item.mode);
      try {
        const result = await extractDocument(item.file, undefined, (progress, label) => {
          patch(item.id, { progress: Math.min(0.99, Math.max(0, progress)), progressLabel: label }, item.mode);
        });
        if (abortRef.current) {
          patch(item.id, { ocrState: "已取消", progress: 0, progressLabel: "" }, item.mode);
          continue;
        }
        const parsed = parsePages(result.pages);
        patch(item.id, (doc) => ({
          ocrState: "已识别",
          progress: 1,
          progressLabel: "",
          pageCount: result.pageCount,
          ocrNote: result.note,
          textByPage: result.pages.map((page) => page.text),
          fields: mergeParsedFields(doc.fields, parsed),
          confirmed: false,
          error: undefined,
        }), item.mode);
      } catch (error) {
        if (abortRef.current) {
          patch(item.id, { ocrState: "已取消", progress: 0, progressLabel: "" }, item.mode);
          continue;
        }
        patch(item.id, {
          ocrState: "识别失败",
          progress: 0,
          progressLabel: "",
          error:
            error instanceof Error
              ? error.message
              : "识别没有完成，请重试或手工填写。原件不会被发送到网络。",
        }, item.mode);
      }
    }
    setRunningId(null);
    setIsRunning(false);
    runningRef.current = false;
    abortRef.current = false;
    if (queueRef.current.length) void runQueue();
  }, [patch]);

  const startRecognition = useCallback(
    (ids?: string[]) => {
      if (runningRef.current) return;
      const selected = docsRef.current[mode].filter((doc) => {
        if (ids && !ids.includes(doc.id)) return false;
        if (!canRecognize(doc.file)) return false;
        if (!ids) {
          return (
            doc.ocrState === "待识别" ||
            doc.ocrState === "已取消" ||
            doc.ocrState === "识别失败"
          );
        }
        return true;
      });
      if (!selected.length) return;
      setDocs((previous) =>
        previous.map((doc) =>
          selected.some((item) => item.id === doc.id)
            ? {
                ...doc,
                ocrState: "待识别",
                progress: 0,
                progressLabel: "",
                error: undefined,
                ocrNote: undefined,
              }
            : doc,
        ),
      );
      const queued = new Set(queueRef.current.map((item) => item.id));
      selected.forEach((doc) => {
        if (queued.has(doc.id)) return;
        queueRef.current.push({ id: doc.id, file: doc.file, mode });
      });
      void runQueue();
    },
    [mode, runQueue, setDocs],
  );

  const cancelRecognition = useCallback(() => {
    abortRef.current = true;
    queueRef.current = [];
    void cancelOcr();
    setDocs((previous) =>
      previous.map((doc) =>
        doc.ocrState === "识别中" || doc.ocrState === "待识别"
          ? { ...doc, ocrState: "已取消", progress: 0, progressLabel: "" }
          : doc,
      ),
    );
  }, [setDocs]);

  const addFiles = useCallback(
    async (input: File[] | FileList): Promise<AddFilesResult> => {
      const files = Array.from(input);
      const rejected: string[] = [];
      const accepted: File[] = [];
      let room = MAX_BATCH_FILES - docsRef.current[mode].length;
      files.forEach((file) => {
        const mime = normalizeMime(file);
        if (!acceptedName(file, mime)) {
          rejected.push(`${file.name}：只支持 JPG、PNG、PDF；OFD 或 HEIC 请保留原件后手工填写。`);
          return;
        }
        if (file.size > MAX_FILE_BYTES) {
          rejected.push(`${file.name}：超过单份 20 MB，请先压缩副本；原件不会被上传。`);
          return;
        }
        if (room <= 0) {
          rejected.push(`${file.name}：本批最多 ${MAX_BATCH_FILES} 份，请先核对已导入的文件。`);
          return;
        }
        room -= 1;
        accepted.push(file);
      });

      const created: LocalDocument[] = [];
      for (const file of accepted) {
        const mime = normalizeMime(file);
        const hash = await sha256File(file);
        const previewKind = previewKindFor(file, mime);
        const supported = canRecognize(file);
        created.push({
          id: crypto.randomUUID(),
          file,
          fileName: file.name,
          mime,
          size: file.size,
          hash,
          archiveType: "待分类",
          previewKind,
          previewUrl:
            previewKind === "image" ? URL.createObjectURL(file) : null,
          ocrState: supported ? "待识别" : "不支持",
          progress: 0,
          progressLabel: "",
          ocrNote: supported ? undefined : "这种格式暂不能自动识别，请保留原件并手工填写。",
          fields: createEmptyFields(),
          confirmed: false,
          dismissedFlags: [],
        });
      }
      if (created.length) {
        setDocs((previous) => [...previous, ...created]);
        const queued = new Set(queueRef.current.map((item) => item.id));
        created.forEach((doc) => {
          if (!canRecognize(doc.file) || queued.has(doc.id)) return;
          queueRef.current.push({ id: doc.id, file: doc.file, mode });
        });
        void runQueue();
      }
      return { added: created.length, rejected };
    },
    [mode, runQueue, setDocs],
  );

  const updateArchiveType = useCallback(
    (id: string, archiveType: string) => {
      if (!isSupportedArchiveType(archiveType)) return;
      patch(id, { archiveType });
    },
    [patch],
  );

  const updateField = useCallback(
    (id: string, key: FieldKey, value: string) => {
      patch(id, (doc) => {
        const previous = doc.fields[key];
        return {
          fields: {
            ...doc.fields,
            [key]: {
              value,
              origin: value ? "家长填写" : "空",
              page: value ? previous.page : undefined,
              snippet: value ? previous.snippet : undefined,
            },
          },
          confirmed: false,
        };
      });
    },
    [patch],
  );

  const setConfirmed = useCallback(
    (id: string, confirmed: boolean) => {
      patch(id, { confirmed });
    },
    [patch],
  );

  const dismissFlag = useCallback(
    (id: string, key: string) => {
      patch(id, (doc) => ({ dismissedFlags: [...doc.dismissedFlags, key] }));
    },
    [patch],
  );

  const removeDoc = useCallback(
    (id: string) => {
      const target = docsRef.current[mode].find((doc) => doc.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      queueRef.current = queueRef.current.filter((item) => item.id !== id);
      setDocs((previous) => previous.filter((doc) => doc.id !== id));
    },
    [mode, setDocs],
  );

  const clearAll = useCallback(() => {
    docsRef.current[mode].forEach((doc) => {
      if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
    });
    queueRef.current = queueRef.current.filter((item) => item.mode !== mode);
    setDocs(() => []);
  }, [mode, setDocs]);

  const loadDemoDocuments = useCallback(
    (next: LocalDocument[]) => {
      docsRef.current.demo.forEach((doc) => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });
      queueRef.current = queueRef.current.filter((item) => item.mode !== "demo");
      setDocsFor("demo", () => next);
    },
    [setDocsFor],
  );

  useEffect(() => {
    return () => {
      docsRef.current.real.forEach((doc) => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });
      docsRef.current.demo.forEach((doc) => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });
      void disposeRecognition();
    };
  }, []);

  const flags = useMemo(
    () =>
      computeFlags(docs, {
        from: xiaoludengRule.expenseFrom,
        to: xiaoludengRule.expenseTo,
      }),
    [docs],
  );

  const visibleFlags = useMemo(() => {
    const result: Record<string, DocFlag[]> = {};
    docs.forEach((doc) => {
      const list = (flags[doc.id] ?? []).filter(
        (flag) => !doc.dismissedFlags.includes(flag.key),
      );
      if (list.length) result[doc.id] = list;
    });
    return result;
  }, [docs, flags]);

  const value = useMemo<DocumentsContextValue>(
    () => ({
      docs,
      flags: visibleFlags,
      isRunning,
      runningId,
      addFiles,
      updateArchiveType,
      updateField,
      setConfirmed,
      dismissFlag,
      removeDoc,
      clearAll,
      startRecognition,
      cancelRecognition,
      loadDemoDocuments,
    }),
    [
      docs,
      visibleFlags,
      isRunning,
      runningId,
      addFiles,
      updateArchiveType,
      updateField,
      setConfirmed,
      dismissFlag,
      removeDoc,
      clearAll,
      startRecognition,
      cancelRecognition,
      loadDemoDocuments,
    ],
  );

  return (
    <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>
  );
}

export function useDocuments(): DocumentsContextValue {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error("useDocuments 必须在 DocumentsProvider 内使用");
  }
  return context;
}
