import { describe, expect, it } from "vitest";
import {
  backupToEntries,
  buildCostStatement,
  costStatementText,
  createBackup,
  createEmptyAid,
  createEmptyAmounts,
  ledgerBackupSchema,
  sourceIndexesAfterSelection,
  summarizeEntries,
  workspaceMismatchMessage,
  type ExpenseEntry,
} from "./ledger";

function makeEntry(overrides: Partial<ExpenseEntry> = {}): ExpenseEntry {
  return {
    id: "entry-1",
    title: "",
    category: "住院",
    expenseDate: "2026-05-12",
    dateStatus: "已确认",
    documentIds: ["doc-1"],
    sourceIndexes: [1],
    amounts: createEmptyAmounts(),
    aid: createEmptyAid(),
    note: "",
    confirmed: true,
    ...overrides,
  };
}

describe("workspaceMismatchMessage", () => {
  it("allows the same workspace", () => {
    expect(workspaceMismatchMessage("real", "real")).toBeNull();
    expect(workspaceMismatchMessage("demo", "demo")).toBeNull();
  });

  it("blocks demo backups in the real workspace and vice versa", () => {
    expect(workspaceMismatchMessage("demo", "real")).toContain("演示工作区");
    expect(workspaceMismatchMessage("real", "demo")).toContain("真实工作区");
  });
});

describe("sourceIndexesAfterSelection", () => {
  const docs = [{ id: "doc-1" }, { id: "doc-2" }];

  it("clears source indexes when a new entry deselects every document", () => {
    expect(
      sourceIndexesAfterSelection({
        previousDocumentIds: ["doc-1"],
        previousSourceIndexes: [1],
        nextDocumentIds: [],
        docs,
        keepRestoredWhenEmpty: false,
      }),
    ).toEqual([]);
  });

  it("keeps restored provenance only before the user changes the selection", () => {
    expect(
      sourceIndexesAfterSelection({
        previousDocumentIds: [],
        previousSourceIndexes: [2, 3],
        nextDocumentIds: [],
        docs,
        keepRestoredWhenEmpty: true,
      }),
    ).toEqual([2, 3]);

    expect(
      sourceIndexesAfterSelection({
        previousDocumentIds: ["doc-2"],
        previousSourceIndexes: [2],
        nextDocumentIds: [],
        docs,
        keepRestoredWhenEmpty: true,
      }),
    ).toEqual([]);
  });

  it("recomputes indexes from the selected documents", () => {
    expect(
      sourceIndexesAfterSelection({
        previousDocumentIds: [],
        previousSourceIndexes: [],
        nextDocumentIds: ["doc-2", "doc-1"],
        docs,
        keepRestoredWhenEmpty: false,
      }),
    ).toEqual([1, 2]);
  });
});

describe("ledger summaries and backup", () => {
  it("counts only confirmed entries and does not fill missing amounts", () => {
    const confirmed = makeEntry({
      amounts: {
        ...createEmptyAmounts(),
        totalFen: { value: "12300", status: "原件明确" },
      },
    });
    const pending = makeEntry({
      id: "entry-2",
      confirmed: false,
      amounts: {
        ...createEmptyAmounts(),
        totalFen: { value: "99900", status: "家长核对" },
      },
    });

    const summary = summarizeEntries([confirmed, pending]);
    expect(summary.entryCount).toBe(1);
    expect(summary.amounts.totalFen).toEqual({ fen: 12300, count: 1 });
    expect(summary.amounts.cashFen).toEqual({ fen: 0, count: 0 });
  });

  it("round-trips confirmed amounts and source indexes without document ids", () => {
    const entry = makeEntry({
      title: "5 月住院",
      amounts: {
        ...createEmptyAmounts(),
        totalFen: { value: "12300", status: "原件明确" },
        cashFen: { value: "300", status: "家长核对" },
      },
    });
    const backup = createBackup([entry], {
      exportedAt: "2026-11-16T00:00:00.000Z",
      mode: "real",
      sourceIndexes: () => [2],
    });

    expect(ledgerBackupSchema.safeParse(backup).success).toBe(true);
    const restored = backupToEntries(backup);
    expect(restored).toHaveLength(1);
    expect(restored[0].documentIds).toEqual([]);
    expect(restored[0].sourceIndexes).toEqual([2]);
    expect(restored[0].amounts.totalFen).toEqual({ value: "12300", status: "原件明确" });
    expect(restored[0].amounts.cashFen).toEqual({ value: "300", status: "家长核对" });
  });
});

describe("buildCostStatement", () => {
  const withAmounts = (values: Partial<Record<"totalFen" | "poolingFen" | "cashFen", string>>) => {
    const amounts = createEmptyAmounts();
    Object.entries(values).forEach(([key, value]) => {
      amounts[key as "totalFen"] = { value: value as string, status: "原件明确" };
    });
    return amounts;
  };

  const entries = [
    makeEntry({ id: "a", title: "住院", amounts: withAmounts({ totalFen: "10000", poolingFen: "6000" }) }),
    makeEntry({
      id: "b",
      title: "外购药",
      category: "外购药",
      amounts: withAmounts({ totalFen: "2500", cashFen: "2500" }),
      aid: { value: "1000", status: "已到账", note: "" },
    }),
    makeEntry({ id: "c", title: "未确认", amounts: withAmounts({ totalFen: "99999" }), confirmed: false }),
  ];
  const statement = buildCostStatement(entries, (entry) => (entry.id === "a" ? "1、2" : ""));
  const row = (key: string) => statement.rows.find((item) => item.key === key)!;

  it("sums only confirmed entries that recorded the amount", () => {
    expect(statement.entryCount).toBe(2);
    expect(row("totalFen").fen).toBe(12500);
    expect(row("totalFen").lines.map((line) => line.entryNumber)).toEqual([1, 2]);
    expect(row("poolingFen").lines).toHaveLength(1);
    expect(row("cashFen").lines.map((line) => line.entryId)).toEqual(["b"]);
    expect(row("aid").fen).toBe(1000);
  });

  it("leaves unrecorded rows empty instead of zero-filling", () => {
    expect(row("criticalIllnessFen").lines).toHaveLength(0);
    const text = costStatementText(statement);
    expect(text).toContain("大病保险支付：未记录");
    expect(text).toContain("费用总额：¥125.00（覆盖 2 笔）");
    expect(text).toContain("原件：1、2");
    expect(text).toContain("原件：原件未关联");
    expect(text).not.toContain("999.99");
  });
});
