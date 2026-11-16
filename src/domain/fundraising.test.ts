import { describe, expect, it } from "vitest";
import { buildFundraisingDraft } from "./fundraising";
import { createEmptyAid, createEmptyAmounts, type ExpenseEntry } from "./ledger";

function makeEntry(overrides: Partial<ExpenseEntry> & { total?: string; cash?: string } = {}): ExpenseEntry {
  const { total, cash, ...rest } = overrides;
  const amounts = createEmptyAmounts();
  if (total) amounts.totalFen = { value: total, status: "原件明确" };
  if (cash) amounts.cashFen = { value: cash, status: "家长核对" };
  return {
    id: "e",
    title: "",
    category: "住院",
    expenseDate: "2026-05-12",
    dateStatus: "已确认",
    documentIds: [],
    sourceIndexes: [],
    amounts,
    aid: createEmptyAid(),
    note: "",
    confirmed: true,
    ...rest,
  };
}

const links: Record<string, number[]> = { a: [1, 2], b: [3], c: [] };
const linkedIndexes = (entry: ExpenseEntry) => links[entry.id] ?? [];

describe("buildFundraisingDraft", () => {
  const entries = [
    makeEntry({ id: "a", title: "住院", total: "100000", cash: "20000" }),
    makeEntry({ id: "b", title: "外购药", category: "外购药", total: "50000" }),
    makeEntry({ id: "c", title: "恢复的账目", category: "外购药", total: "1000" }),
    makeEntry({ id: "d", title: "未确认", total: "999999", confirmed: false }),
  ];
  const draft = buildFundraisingDraft(entries, { platformName: "测试平台", linkedIndexes });

  it("attaches source document indexes to every amount line", () => {
    expect(draft).toContain(
      "有来源的费用总额：¥1510.00（覆盖 3 笔，对应原件第 1、2、3 份，其中 1 笔原件未关联）",
    );
    expect(draft).toContain("个人现金支付：¥200.00（覆盖 1 笔，对应原件第 1、2 份）");
    expect(draft).toContain("外购药：¥510.00（覆盖 2 笔，对应原件第 3 份，其中 1 笔原件未关联）");
  });

  it("excludes unconfirmed entries and keeps unrecorded amounts as 未记录", () => {
    expect(draft).not.toContain("9999.99");
    expect(draft).toContain("已到账公益救助：未记录");
    expect(draft).not.toContain("大病保险支付");
  });

  it("lists each confirmed entry with its originals in the appendix", () => {
    expect(draft).toContain("第 1 笔 · 住院 · 住院 · 2026-05-12 · 费用总额 ¥1000.00 · 原件第 1、2 份");
    expect(draft).toContain("第 3 笔 · 恢复的账目 · 外购药 · 2026-05-12 · 费用总额 ¥10.00 · 原件未关联");
    expect(draft).not.toContain("第 4 笔");
  });
});
