import { describe, expect, it } from "vitest";
import {
  backupToEntries,
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
