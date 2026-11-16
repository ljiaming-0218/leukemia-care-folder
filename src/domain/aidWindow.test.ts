import { describe, expect, it } from "vitest";
import { aidRules, defaultAidRule, findAidRule, unstructuredCharityResources } from "@/src/data/policies/aidRules";
import { policyResources } from "@/src/data/policies/resources";
import { entryWindowTag, groupEntriesByWindow } from "./aidWindow";
import { createEmptyAid, createEmptyAmounts, type ExpenseEntry } from "./ledger";

function makeEntry(overrides: Partial<ExpenseEntry> = {}): ExpenseEntry {
  return {
    id: "e",
    title: "",
    category: "外购药",
    expenseDate: "2026-05-01",
    dateStatus: "已确认",
    documentIds: [],
    sourceIndexes: [],
    amounts: createEmptyAmounts(),
    aid: createEmptyAid(),
    note: "",
    confirmed: true,
    ...overrides,
  };
}

const rule = defaultAidRule;

describe("aid rules", () => {
  it("links every structured rule to an existing resource card", () => {
    aidRules.forEach((item) => {
      expect(policyResources.some((resource) => resource.id === item.resourceId)).toBe(true);
    });
    expect(findAidRule("not-a-rule")).toBeUndefined();
  });

  it("lists other charity resources as unstructured", () => {
    const ids = unstructuredCharityResources.map((resource) => resource.id);
    expect(ids).not.toContain(rule.resourceId);
    expect(ids).toContain("national-xiaotianshi");
  });
});

describe("entryWindowTag", () => {
  it("includes both window boundaries", () => {
    expect(entryWindowTag(makeEntry({ expenseDate: rule.expenseFrom }), rule)).toBe("窗口内");
    expect(entryWindowTag(makeEntry({ expenseDate: rule.expenseTo }), rule)).toBe("窗口内");
    expect(entryWindowTag(makeEntry({ expenseDate: "2026-03-31" }), rule)).toBe("窗口外");
  });

  it("marks unconfirmed or missing dates as pending", () => {
    expect(entryWindowTag(makeEntry({ dateStatus: "待核对" }), rule)).toBe("日期待核对");
    expect(entryWindowTag(makeEntry({ expenseDate: "", dateStatus: "待核对" }), rule)).toBe("日期待核对");
  });
});

describe("groupEntriesByWindow", () => {
  it("only counts confirmed entries in the rule's categories and never zero-fills totals", () => {
    const amounts = createEmptyAmounts();
    amounts.totalFen = { value: "3000", status: "原件明确" };
    const entries = [
      makeEntry({ id: "in", amounts }),
      makeEntry({ id: "in-no-total" }),
      makeEntry({ id: "out", expenseDate: "2027-01-02" }),
      makeEntry({ id: "pending", dateStatus: "待核对" }),
      makeEntry({ id: "hospital", category: "住院" }),
      makeEntry({ id: "unconfirmed", confirmed: false }),
    ];
    const groups = Object.fromEntries(
      groupEntriesByWindow(entries, rule).map((group) => [group.tag, group]),
    );
    expect(groups["窗口内"].entries.map(({ entry }) => entry.id)).toEqual(["in", "in-no-total"]);
    expect(groups["窗口内"].totalFen).toBe(3000);
    expect(groups["窗口内"].totalCount).toBe(1);
    expect(groups["窗口外"].entries.map(({ entryNumber }) => entryNumber)).toEqual([3]);
    expect(groups["日期待核对"].entries).toHaveLength(1);
    expect(groups["窗口外"].totalCount).toBe(0);
  });
});
