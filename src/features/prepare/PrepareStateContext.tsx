import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { xiaoludengRule } from "@/src/data/policies/xiaoludeng";
import type { MaterialState } from "@/src/domain/schemas";
import { useWorkspace, type WorkspaceMode } from "@/src/features/workspace/WorkspaceContext";
import { loadValue, saveValue } from "@/src/lib/localStore";

type PrepareStateMap = Record<string, MaterialState>;
type LinkedDocumentsMap = Record<string, string[]>;

const PREPARE_KEY = "real:prepare";

type StoredPrepare = { states: PrepareStateMap; links: LinkedDocumentsMap };

type PrepareStateValue = {
  states: PrepareStateMap;
  setState: (id: string, state: MaterialState) => void;
  linkedDocuments: LinkedDocumentsMap;
  linkDocument: (itemId: string, documentId: string) => void;
  unlinkDocument: (itemId: string, documentId: string) => void;
  reset: () => void;
  checkedCount: number;
  pendingCount: number;
  total: number;
  loadDemoPrepare: (states: PrepareStateMap, links: LinkedDocumentsMap) => void;
};

const PrepareStateContext = createContext<PrepareStateValue | null>(null);

export function PrepareStateProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const [statesByMode, setStatesByMode] = useState<Record<WorkspaceMode, PrepareStateMap>>({
    real: {},
    demo: {},
  });
  const [linksByMode, setLinksByMode] = useState<Record<WorkspaceMode, LinkedDocumentsMap>>({
    real: {},
    demo: {},
  });
  const states = statesByMode[mode];
  const linkedDocuments = linksByMode[mode];
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadValue<StoredPrepare>(PREPARE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored) {
        setStatesByMode((previous) => ({
          ...previous,
          real: { ...stored.states, ...previous.real },
        }));
        setLinksByMode((previous) => ({
          ...previous,
          real: { ...stored.links, ...previous.real },
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
    const stored: StoredPrepare = { states: statesByMode.real, links: linksByMode.real };
    void saveValue(PREPARE_KEY, stored);
  }, [hydrated, statesByMode.real, linksByMode.real]);

  const value = useMemo<PrepareStateValue>(() => {
    const items = xiaoludengRule.materialItems;
    const checked = items.filter(
      (item) =>
        states[item.id] === "已准备" || states[item.id] === "已向项目方确认无需提供",
    ).length;
    const pending = items.filter((item) => states[item.id] === "待确认").length;

    return {
      states,
      setState: (id, state) =>
        setStatesByMode((previous) => ({
          ...previous,
          [mode]: { ...previous[mode], [id]: state },
        })),
      linkedDocuments,
      linkDocument: (itemId, documentId) =>
        setLinksByMode((previous) => {
          const current = previous[mode][itemId] ?? [];
          if (current.includes(documentId)) return previous;
          return {
            ...previous,
            [mode]: { ...previous[mode], [itemId]: [...current, documentId] },
          };
        }),
      unlinkDocument: (itemId, documentId) =>
        setLinksByMode((previous) => {
          const next = (previous[mode][itemId] ?? []).filter((id) => id !== documentId);
          const modeLinks = { ...previous[mode] };
          if (!next.length) {
            delete modeLinks[itemId];
          } else {
            modeLinks[itemId] = next;
          }
          return { ...previous, [mode]: modeLinks };
        }),
      reset: () => {
        setStatesByMode((previous) => ({ ...previous, [mode]: {} }));
        setLinksByMode((previous) => ({ ...previous, [mode]: {} }));
      },
      checkedCount: checked,
      pendingCount: pending,
      total: items.length,
      loadDemoPrepare: (nextStates, nextLinks) => {
        setStatesByMode((previous) => ({ ...previous, demo: nextStates }));
        setLinksByMode((previous) => ({ ...previous, demo: nextLinks }));
      },
    };
  }, [states, linkedDocuments, mode]);

  return <PrepareStateContext.Provider value={value}>{children}</PrepareStateContext.Provider>;
}

export function usePrepareState(): PrepareStateValue {
  const value = useContext(PrepareStateContext);
  if (!value) {
    throw new Error("usePrepareState 必须在 PrepareStateProvider 内使用");
  }
  return value;
}
