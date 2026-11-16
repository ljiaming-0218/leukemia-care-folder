import { isValidIsoDate, isWithinWindow, type LocalDocument } from "./documents";
import { entryAmountFen, inferCategoryFromDocs, type ExpenseEntry } from "./ledger";
import type { AidRule } from "./schemas";

export const windowTags = ["窗口内", "窗口外", "日期待核对"] as const;
export type WindowTag = (typeof windowTags)[number];

export function entryWindowTag(entry: ExpenseEntry, rule: AidRule): WindowTag {
  if (entry.dateStatus !== "已确认" || !isValidIsoDate(entry.expenseDate)) return "日期待核对";
  return isWithinWindow(entry.expenseDate, rule.expenseFrom, rule.expenseTo) ? "窗口内" : "窗口外";
}

export function isRuleCategory(entry: ExpenseEntry, rule: AidRule): boolean {
  return (rule.eligibleCategories as string[]).includes(entry.category);
}

export type RuleEntryGroup = {
  tag: WindowTag;
  entries: { entry: ExpenseEntry; entryNumber: number }[];
  totalFen: number;
  totalCount: number;
};

export function groupEntriesByWindow(entries: ExpenseEntry[], rule: AidRule): RuleEntryGroup[] {
  return windowTags.map((tag) => {
    const matched = entries
      .map((entry, index) => ({ entry, entryNumber: index + 1 }))
      .filter(
        ({ entry }) =>
          entry.confirmed && isRuleCategory(entry, rule) && entryWindowTag(entry, rule) === tag,
      );
    const totals = matched
      .map(({ entry }) => entryAmountFen(entry, "totalFen"))
      .filter((fen): fen is number => fen !== null);
    return {
      tag,
      entries: matched,
      totalFen: totals.reduce((sum, fen) => sum + fen, 0),
      totalCount: totals.length,
    };
  });
}

export function docInRule(doc: LocalDocument, rule: AidRule): boolean {
  return (rule.eligibleCategories as string[]).includes(inferCategoryFromDocs([doc]));
}
