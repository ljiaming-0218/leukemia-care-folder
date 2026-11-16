import { describe, expect, it } from "vitest";
import { findGapHints, gapHintsText } from "./gapCheck";
import {
  createEmptyAid,
  createEmptyAmounts,
  type AmountKey,
  type ExpenseEntry,
} from "./ledger";
import { policyResources } from "@/src/data/policies/resources";

function makeEntry(
  id: string,
  category: ExpenseEntry["category"],
  values: Partial<Record<AmountKey, string>>,
  extra: Partial<ExpenseEntry> = {},
): ExpenseEntry {
  const amounts = createEmptyAmounts();
  for (const [key, value] of Object.entries(values)) {
    amounts[key as AmountKey] = { value: value as string, status: "原件明确" };
  }
  return {
    id,
    title: id,
    category,
    expenseDate: "2026-05-12",
    dateStatus: "已确认",
    documentIds: [],
    sourceIndexes: [],
    amounts,
    aid: createEmptyAid(),
    note: "",
    confirmed: true,
    ...extra,
  };
}

const ids = (entries: ExpenseEntry[]) => findGapHints(entries).map((hint) => hint.id);

describe("findGapHints", () => {
  it("flags a visit with a total but no pooling payment", () => {
    const hints = findGapHints([makeEntry("a", "住院", { totalFen: "100000" })]);
    expect(hints.map((hint) => hint.id)).toEqual(["no-pooling"]);
    expect(hints[0].entries.map((item) => item.entryNumber)).toEqual([1]);
  });

  it("flags missing critical illness and assistance only when the triggering fields are recorded", () => {
    const settled = makeEntry("a", "住院", {
      totalFen: "100000",
      poolingFen: "60000",
      criticalIllnessFen: "10000",
      assistanceFen: "5000",
      cashFen: "25000",
    });
    expect(ids([settled])).toEqual([]);
    const partial = makeEntry("b", "住院", { totalFen: "100000", poolingFen: "60000", cashFen: "40000" });
    expect(ids([partial])).toEqual(["no-critical-illness", "cash-no-assistance"]);
  });

  it("treats outside drugs and gene tests separately and respects received aid", () => {
    const drug = makeEntry("d", "外购药", { totalFen: "328000" });
    const gene = makeEntry("g", "基因检测", { totalFen: "860000" });
    const geneWithAid = makeEntry("h", "基因检测", { totalFen: "860000" }, {
      aid: { value: "500000", status: "已到账", note: "" },
    });
    const hints = findGapHints([drug, gene, geneWithAid]);
    expect(hints.map((hint) => hint.id)).toEqual(["drug-dual-channel", "charity-scope"]);
    expect(hints[1].entries.map((item) => item.entryNumber)).toEqual([1, 2]);
  });

  it("ignores unconfirmed entries", () => {
    expect(ids([makeEntry("a", "住院", { totalFen: "100000" }, { confirmed: false })])).toEqual([]);
  });

  it("only links resource cards that exist", () => {
    const known = new Set(policyResources.map((resource) => resource.id));
    const all = findGapHints([
      makeEntry("a", "住院", { totalFen: "1" }),
      makeEntry("b", "门诊", { poolingFen: "1", cashFen: "1" }),
      makeEntry("c", "外购药", {}),
    ]);
    expect(all).toHaveLength(5);
    for (const hint of all) for (const id of hint.resourceIds) expect(known.has(id)).toBe(true);
    expect(gapHintsText(all)).toContain("1. 这几笔就诊没有记录医保统筹支付（第 1 笔）");
  });
});
