import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { aidRules, defaultAidRule } from "@/src/data/policies/aidRules";
import type { MaterialState } from "@/src/domain/schemas";
import { useAidRule } from "@/src/features/prepare/AidRuleContext";
import { useWorkspace, type WorkspaceMode } from "@/src/features/workspace/WorkspaceContext";
import { loadValue, saveValue } from "@/src/lib/localStore";

type PrepareStateMap = Record<string, MaterialState>;
type LinkedDocumentsMap = Record<string, string[]>;
type RulePrepare = { states: PrepareStateMap; links: LinkedDocumentsMap };
type PrepareByRule = Record<string, RulePrepare>;

const PREPARE_KEY = "real:prepare";

type StoredPrepare = { version: 2; byRule: PrepareByRule };
type LegacyStoredPrepare = { states: PrepareStateMap; links: LinkedDocumentsMap };

const emptyRule: RulePrepare = { states: {}, links: {} };

function readStored(stored: StoredPrepare | LegacyStoredPrepare | null | undefined): PrepareByRule {
  if (!stored) return {};
  if ("byRule" in stored) return stored.byRule;
  return { [defaultAidRule.id]: { states: stored.states ?? {}, links: stored.links ?? {} } };
}

type PrepareStateValue = {
  states: PrepareStateMap;
  setState: (id: string, state: MaterialState) => void;
  linkedDocuments: LinkedDocumentsMap;
  linkDocument: (itemId: string, documentId: string) => void;
  unlinkDocument: (itemId: string, documentId: string) => void;
  reset: () => void;
  resetAll: () => void;
  checkedCount: number;
  pendingCount: number;
  total: number;
  linkedDocumentIds: Set<string>;
  linkedMaterialLabels: (documentId: string) => string[];
  loadDemoPrepare: (states: PrepareStateMap, links: LinkedDocumentsMap) => void;
};

const PrepareStateContext = createContext<PrepareStateValue | null>(null);

export function PrepareStateProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const { rule } = useAidRule();
  const [byMode, setByMode] = useState<Record<WorkspaceMode, PrepareByRule>>({
    real: {},
    demo: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadValue<StoredPrepare | LegacyStoredPrepare>(PREPARE_KEY).then((stored) => {
      if (cancelled) return;
      const restored = readStored(stored);
      setByMode((previous) => {
        const real: PrepareByRule = { ...restored };
        Object.entries(previous.real).forEach(([ruleId, current]) => {
          const saved = restored[ruleId] ?? emptyRule;
          real[ruleId] = {
            states: { ...saved.states, ...current.states },
            links: { ...saved.links, ...current.links },
          };
        });
        return { ...previous, real };
      });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredPrepare = { version: 2, byRule: byMode.real };
    void saveValue(PREPARE_KEY, stored);
  }, [hydrated, byMode.real]);

  const updateRule = useCallback(
    (update: (current: RulePrepare) => RulePrepare) =>
      setByMode((previous) => ({
        ...previous,
        [mode]: {
          ...previous[mode],
          [rule.id]: update(previous[mode][rule.id] ?? emptyRule),
        },
      })),
    [mode, rule.id],
  );

  const value = useMemo<PrepareStateValue>(() => {
    const current = byMode[mode][rule.id] ?? emptyRule;
    const { states, links } = current;
    const items = rule.materialItems;
    const checked = items.filter(
      (item) =>
        states[item.id] === "已准备" || states[item.id] === "已向项目方确认无需提供",
    ).length;
    const pending = items.filter((item) => states[item.id] === "待确认").length;
    const modeRules = byMode[mode];
    const linkedDocumentIds = new Set(
      Object.values(modeRules).flatMap((entry) => Object.values(entry.links).flat()),
    );

    return {
      states,
      setState: (id, state) =>
        updateRule((previous) => ({ ...previous, states: { ...previous.states, [id]: state } })),
      linkedDocuments: links,
      linkDocument: (itemId, documentId) =>
        updateRule((previous) => {
          const list = previous.links[itemId] ?? [];
          if (list.includes(documentId)) return previous;
          return { ...previous, links: { ...previous.links, [itemId]: [...list, documentId] } };
        }),
      unlinkDocument: (itemId, documentId) =>
        updateRule((previous) => {
          const next = (previous.links[itemId] ?? []).filter((id) => id !== documentId);
          const nextLinks = { ...previous.links };
          if (next.length) nextLinks[itemId] = next;
          else delete nextLinks[itemId];
          return { ...previous, links: nextLinks };
        }),
      reset: () => updateRule(() => emptyRule),
      resetAll: () => setByMode((previous) => ({ ...previous, [mode]: {} })),
      checkedCount: checked,
      pendingCount: pending,
      total: items.length,
      linkedDocumentIds,
      linkedMaterialLabels: (documentId) =>
        aidRules.flatMap((aidRule) => {
          const ruleLinks = modeRules[aidRule.id]?.links ?? {};
          return aidRule.materialItems
            .filter((item) => ruleLinks[item.id]?.includes(documentId))
            .map((item) => `${aidRule.shortName} · ${item.label}`);
        }),
      loadDemoPrepare: (nextStates, nextLinks) =>
        setByMode((previous) => ({
          ...previous,
          demo: { [defaultAidRule.id]: { states: nextStates, links: nextLinks } },
        })),
    };
  }, [byMode, mode, rule, updateRule]);

  return <PrepareStateContext.Provider value={value}>{children}</PrepareStateContext.Provider>;
}

export function usePrepareState(): PrepareStateValue {
  const value = useContext(PrepareStateContext);
  if (!value) {
    throw new Error("usePrepareState 必须在 PrepareStateProvider 内使用");
  }
  return value;
}
