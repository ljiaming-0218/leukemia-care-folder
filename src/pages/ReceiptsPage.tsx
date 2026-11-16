import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentCard } from "@/src/components/DocumentCard";
import { DocumentPreview } from "@/src/components/DocumentPreview";
import { PageHeader } from "@/src/components/PageHeader";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { usePrepareState } from "@/src/features/prepare/PrepareStateContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import type { LocalDocument } from "@/src/domain/documents";
import { usePageTitle } from "@/src/lib/usePageTitle";

const waitingStates = ["待识别", "已取消", "识别失败"];

export default function ReceiptsPage() {
  usePageTitle("票据导入与核对");
  const { isDemo, modeLabel, demoStatus } = useWorkspace();
  const {
    docs,
    flags,
    isRunning,
    runningId,
    addFiles,
    clearAll,
    startRecognition,
    cancelRecognition,
  } = useDocuments();
  const { usedDocumentIds } = useLedger();
  const { linkedDocuments } = usePrepareState();
  const linkedDocumentIds = useMemo(
    () => new Set(Object.values(linkedDocuments).flat()),
    [linkedDocuments],
  );
  const protectedDocs = useMemo(
    () =>
      docs.filter(
        (doc) => usedDocumentIds.has(doc.id) || linkedDocumentIds.has(doc.id),
      ),
    [docs, linkedDocumentIds, usedDocumentIds],
  );
  const [preview, setPreview] = useState<{ id: string; page?: number } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const [addedMessage, setAddedMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const counts = useMemo(() => {
    const confirmed = docs.filter((doc) => doc.confirmed).length;
    const failed = docs.filter((doc) => doc.ocrState === "识别失败").length;
    const unsupported = docs.filter((doc) => doc.ocrState === "不支持").length;
    const flagged = docs.filter((doc) => (flags[doc.id] ?? []).length > 0).length;
    const runnable = docs.filter(
      (doc) => waitingStates.includes(doc.ocrState) && doc.ocrState !== "不支持",
    ).length;
    return { confirmed, failed, unsupported, flagged, runnable };
  }, [docs, flags]);

  const flaggedDocs = useMemo(
    () => docs.filter((doc) => (flags[doc.id] ?? []).length > 0),
    [docs, flags],
  );

  const previewDoc = preview ? docs.find((doc) => doc.id === preview.id) : undefined;
  const previewIndex = previewDoc ? docs.findIndex((doc) => doc.id === previewDoc.id) : 0;

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!fileList.length) return;
    setIsAdding(true);
    setRejected([]);
    setAddedMessage("");
    try {
      const result = await addFiles(fileList);
      setRejected(result.rejected);
      if (result.added) {
        setAddedMessage(`本次加入 ${result.added} 份原件，已开始本机识别。`);
      }
    } finally {
      setIsAdding(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scrollToDoc = (id: string) => {
    document.getElementById(`doc-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader
        eyebrow="家庭费用与票据夹 · 第一步"
        title="导入、看原件、逐张核对"
        lead="票据和证明材料在当前浏览器里处理，原件按原始字节保留；识别使用随站点发布的本地语言包。"
      />

      <p className="notice" role="note">
        当前为{modeLabel}，文件只在本次页面会话中保留。每批最多 20 份，单份 20 MB。
      </p>
      {isDemo && demoStatus === "ready" && (
        <p className="callout" role="note">
          演示票据已预填并标记为已核对，可直接查看原件、修改字段，或在账本页核对三笔账目。
        </p>
      )}

      <section className="section" aria-labelledby="import-title">
        <div className="section__head">
          <h2 className="section__title" id="import-title">
            导入票据
          </h2>
          <p className="section__note">JPG、PNG、PDF 自动识别；OFD、HEIC 保留原件后手工填写</p>
        </div>

        <div
          className={`drop-zone${isDragging ? " drop-zone--active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <div>
            <p className="drop-zone__title">把发票、费用清单、结算单或证明材料拖到这里</p>
            <p className="meta-line">
              也可以逐个选择。医院发票、费用明细和结算单可以以后在账本里归到同一次就诊。
            </p>
          </div>
          <div className="btn-row">
            <label className={`btn btn--primary file-picker${isAdding ? " is-disabled" : ""}`}>
              {isAdding ? "正在读取原件…" : "选择文件"}
              <input
                ref={fileInputRef}
                type="file"
                className="file-picker__input"
                multiple
                disabled={isAdding}
                aria-label="选择票据文件"
                accept=".jpg,.jpeg,.png,.pdf,.ofd,.heic,.heif,image/jpeg,image/png,application/pdf"
                onChange={(event) => {
                  if (event.target.files) void handleFiles(event.target.files);
                }}
              />
            </label>
            {isRunning ? (
              <button type="button" className="btn btn--ghost" onClick={cancelRecognition}>
                取消识别
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => startRecognition()}
                disabled={counts.runnable === 0}
              >
                开始识别{counts.runnable ? `（${counts.runnable}）` : ""}
              </button>
            )}
            {docs.length > 0 &&
              (protectedDocs.length > 0 ? (
                <span className="notice notice--warn" role="status">
                  有 {protectedDocs.length} 份原件已用于<Link to="/ledger">家庭账目</Link>或
                  <Link to="/prepare">提交准备</Link>，需先解除关联才能清空。
                </span>
              ) : confirmClear ? (
                <span className="inline-confirm">
                  <span>清空后需要重新导入。</span>
                  <button
                    type="button"
                    className="btn btn--danger btn--small"
                    onClick={() => {
                      if (protectedDocs.length > 0) return;
                      clearAll();
                      setConfirmClear(false);
                      setAddedMessage("");
                      setRejected([]);
                      setPreview(null);
                    }}
                  >
                    确认清空
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => setConfirmClear(false)}
                  >
                    取消
                  </button>
                </span>
              ) : (
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmClear(true)}>
                  清空本批
                </button>
              ))}
          </div>
          <p className="meta-line">
            首次识别需加载约 31 MB 语言包，加载后本页复用；可随时取消，失败的条目可重试或手工填写。
          </p>
        </div>

        {addedMessage && (
          <p className="callout" role="status">
            {addedMessage}
          </p>
        )}
        {rejected.length > 0 && (
          <div className="notice notice--warn" role="alert">
            <p>以下文件没有加入本批：</p>
            <ul className="plain-list">
              {rejected.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {docs.length > 0 && (
        <section className="section" aria-labelledby="batch-title">
          <div className="section__head">
            <h2 className="section__title" id="batch-title">
              本批 {docs.length} 份
            </h2>
            <p className="section__note" role="status">
              已核对 {counts.confirmed} 份 · 待核对 {docs.length - counts.confirmed} 份
              {counts.failed ? ` · 识别失败 ${counts.failed} 份` : ""}
              {counts.unsupported ? ` · 手工填写 ${counts.unsupported} 份` : ""}
              {counts.flagged ? ` · 有提示 ${counts.flagged} 份` : ""}
            </p>
          </div>

          {runningId && docs.some((doc) => doc.ocrState === "识别中") && (
            <p className="status-strip" role="status">
              正在逐份识别：第 {docs.findIndex((doc) => doc.id === runningId) + 1} 份。可随时取消，已完成的字段会保留。
            </p>
          )}

          {flaggedDocs.length > 0 && (
            <div className="issue-panel">
              <h3 className="subhead">先看这几张</h3>
              <p className="meta-line">只是提示，不会自动合并或改动金额。</p>
              <ul className="issue-list">
                {flaggedDocs.map((doc) => {
                  const index = docs.findIndex((item) => item.id === doc.id);
                  return (
                    <li key={doc.id}>
                      <button type="button" className="link-button" onClick={() => scrollToDoc(doc.id)}>
                        第 {index + 1} 份 · {(flags[doc.id] ?? []).map((flag) => flag.label).join("、")}
                      </button>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setPreview({ id: doc.id })}
                      >
                        看原件
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="doc-list">
            {docs.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                index={index}
                flags={flags[doc.id] ?? []}
                onPreview={(target: LocalDocument, page?: number) =>
                  setPreview({ id: target.id, page })
                }
              />
            ))}
          </div>
        </section>
      )}

      {docs.length === 0 && (
        <>
          <section className="section" aria-labelledby="flow-title">
            <div className="section__head">
              <h2 className="section__title" id="flow-title">
                导入后会发生什么
              </h2>
              <p className="section__note">先原件、后字段，识别结果都可以改</p>
            </div>
            <ol className="flow">
              <li>
                <b>保存原件</b>
                <span>按原始字节保留，并计算 SHA-256。</span>
              </li>
              <li>
                <b>本机识别</b>
                <span>PDF 先读文字层；扫描件和图片在本地 Worker 里识别中英文。</span>
              </li>
              <li>
                <b>逐张核对</b>
                <span>票号、机构、日期、项目原文和金额都能回到原件页码查看。</span>
              </li>
              <li>
                <b>家长确认</b>
                <span>点过「我已核对这些字段」才算已核对。</span>
              </li>
            </ol>
          </section>
        </>
      )}

      <div className="btn-row">
        <Link className="btn btn--ghost" to="/learn">
          先看票据字段怎么区分
        </Link>
        <Link className="btn btn--ghost" to="/prepare">
          去提交准备页
        </Link>
      </div>

      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          index={previewIndex}
          initialPage={preview?.page}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
