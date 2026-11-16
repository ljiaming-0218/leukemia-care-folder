import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { defaultAidRule, findAidRule } from "@/src/data/policies/aidRules";
import type { AidRule } from "@/src/domain/schemas";

type AidRuleValue = { rule: AidRule; selectRule: (id: string) => void };

const AidRuleContext = createContext<AidRuleValue | null>(null);

export function AidRuleProvider({ children }: { children: ReactNode }) {
  const [ruleId, setRuleId] = useState(defaultAidRule.id);
  const value = useMemo<AidRuleValue>(
    () => ({
      rule: findAidRule(ruleId) ?? defaultAidRule,
      selectRule: (id) => {
        if (findAidRule(id)) setRuleId(id);
      },
    }),
    [ruleId],
  );
  return <AidRuleContext.Provider value={value}>{children}</AidRuleContext.Provider>;
}

export function useAidRule(): AidRuleValue {
  const value = useContext(AidRuleContext);
  if (!value) throw new Error("useAidRule 必须在 AidRuleProvider 内使用");
  return value;
}
