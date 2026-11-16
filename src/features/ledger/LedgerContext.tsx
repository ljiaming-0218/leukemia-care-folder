import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExpenseEntry } from "@/src/domain/ledger";
import { useWorkspace, type WorkspaceMode } from "@/src/features/workspace/WorkspaceContext";
import { loadValue, saveValue } from "@/src/lib/localStore";

const LEDGER_KEY = "real:ledger";

type StoredLedger = {
  entries: ExpenseEntry[];
  lastImport: ImportMeta | null;
};

type AddResult = { ok: true } | { ok: false; error: string };

type ImportMeta = {
  fingerprint: string;
  exportedAt: string;
};

type LedgerContextValue = {
  entries: ExpenseEntry[];
  usedDocumentIds: Set<string>;
  addEntry: (entry: ExpenseEntry) => AddResult;
  updateEntry: (id: string, patch: Partial<ExpenseEntry>) => AddResult;
  removeEntry: (id: string) => void;
  setConfirmed: (id: string, confirmed: boolean) => void;
  replaceEntries: (
    target: WorkspaceMode,
    entries: ExpenseEntry[],
    meta: ImportMeta,
  ) => void;
  clearLedger: () => void;
  lastImport: ImportMeta | null;
  loadDemoEntries: (next: ExpenseEntry[]) => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

function findCollision(entries: ExpenseEntry[], docIds: string[], excludeId?: string): string | null {
  const otherIds = new Set(
    entries.filter((entry) => entry.id !== excludeId).flatMap((entry) => entry.documentIds),
  );
  const hits = docIds.filter((id) => otherIds.has(id));
  return hits.length ? hits[0] : null;
}

function localDateStamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
}

export function localToday(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function downloadStamp(): string {
  return localDateStamp();
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const [entriesByMode, setEntriesByMode] = useState<Record<WorkspaceMode, ExpenseEntry[]>>({
    real: [],
    demo: [],
  });
  const [lastImportByMode, setLastImportByMode] = useState<
    Record<WorkspaceMode, ImportMeta | null>
  >({ real: null, demo: null });
  const [hydrated, setHydrated] = useState(false);
  const entries = entriesByMode[mode];
  const lastImport = lastImportByMode[mode];

  useEffect(() => {
    let cancelled = false;
    void loadValue<StoredLedger>(LEDGER_KEY).then((stored) => {
      if (cancelled) return;
      if (stored && Array.isArray(stored.entries)) {
        setEntriesByMode((previous) => ({
          ...previous,
          real: [...stored.entries, ...previous.real],
        }));
        setLastImportByMode((previous) => ({
          ...previous,
          real: previous.real ?? stored.lastImport ?? null,
        }));
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredLedger = {
      entries: entriesByMode.real,
      lastImport: lastImportByMode.real,
    };
    void saveValue(LEDGER_KEY, stored);
  }, [hydrated, entriesByMode.real, lastImportByMode.real]);

  const setEntriesFor = useCallback(
    (target: WorkspaceMode, update: (previous: ExpenseEntry[]) => ExpenseEntry[]) => {
      setEntriesByMode((previous) => ({ ...previous, [target]: update(previous[target]) }));
    },
    [],
  );

  const setEntries = useCallback(
    (update: (previous: ExpenseEntry[]) => ExpenseEntry[]) => setEntriesFor(mode, update),
    [mode, setEntriesFor],
  );

  const addEntry = useCallback(
    (entry: ExpenseEntry): AddResult => {
      if (findCollision(entries, entry.documentIds)) {
        return {
          ok: false,
          error: "同一份原件只能归入一笔账目，请先在原来的账目里移除。",
        };
      }
      setEntries((previous) => [...previous, entry]);
      return { ok: true };
    },
    [entries, setEntries],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<ExpenseEntry>): AddResult => {
      if (patch.documentIds && findCollision(entries, patch.documentIds, id)) {
        return {
          ok: false,
          error: "同一份原件只能归入一笔账目，请先在原来的账目里移除。",
        };
      }
      setEntries((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
      );
      return { ok: true };
    },
    [entries, setEntries],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((previous) => previous.filter((entry) => entry.id !== id));
    },
    [setEntries],
  );

  const setConfirmed = useCallback(
    (id: string, confirmed: boolean) => {
      setEntries((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, confirmed } : entry)),
      );
    },
    [setEntries],
  );

  const replaceEntries = useCallback(
    (target: WorkspaceMode, next: ExpenseEntry[], meta: ImportMeta) => {
      setEntriesFor(target, () => next);
      setLastImportByMode((previous) => ({ ...previous, [target]: { ...meta } }));
    },
    [setEntriesFor],
  );

  const clearLedger = useCallback(() => {
    setEntriesFor(mode, () => []);
    setLastImportByMode((previous) => ({ ...previous, [mode]: null }));
  }, [mode, setEntriesFor]);

  const loadDemoEntries = useCallback(
    (next: ExpenseEntry[]) => {
      setEntriesFor("demo", () => next);
      setLastImportByMode((previous) => ({ ...previous, demo: null }));
    },
    [setEntriesFor],
  );

  const usedDocumentIds = useMemo(
    () => new Set(entries.flatMap((entry) => entry.documentIds)),
    [entries],
  );

  const value = useMemo<LedgerContextValue>(
    () => ({
      entries,
      usedDocumentIds,
      addEntry,
      updateEntry,
      removeEntry,
      setConfirmed,
      replaceEntries,
      clearLedger,
      lastImport,
      loadDemoEntries,
    }),
    [
      entries,
      usedDocumentIds,
      addEntry,
      updateEntry,
      removeEntry,
      setConfirmed,
      replaceEntries,
      clearLedger,
      lastImport,
      loadDemoEntries,
    ],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const value = useContext(LedgerContext);
  if (!value) {
    throw new Error("useLedger 必须在 LedgerProvider 内使用");
  }
  return value;
}
