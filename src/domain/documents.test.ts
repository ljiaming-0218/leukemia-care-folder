import { describe, expect, it } from "vitest";
import { defaultAidRule } from "@/src/data/policies/aidRules";
import { docInRule } from "./aidWindow";
import {
  computeFlags,
  createEmptyFields,
  yuanInputToFen,
  type LocalDocument,
} from "./documents";

function makeDoc(id: string, overrides: Partial<LocalDocument> = {}): LocalDocument {
  return {
    id,
    file: {} as File,
    fileName: `${id}.png`,
    mime: "image/png",
    size: 1,
    hash: id,
    archiveType: "住院发票",
    previewKind: "image",
    previewUrl: null,
    ocrState: "已识别",
    progress: 100,
    fields: createEmptyFields(),
    confirmed: false,
    dismissedFlags: [],
    ...overrides,
  };
}

const window = { from: "2026-04-01", to: "2026-12-31", name: "小鹿灯第五期", applies: () => true };

describe("yuanInputToFen", () => {
  it("accepts yuan values with up to two decimals", () => {
    expect(yuanInputToFen("1234.56")).toBe("123456");
    expect(yuanInputToFen("1,234")).toBe("123400");
    expect(yuanInputToFen("")).toBe("");
  });

  it("rejects negative and malformed values", () => {
    expect(yuanInputToFen("-1")).toBeUndefined();
    expect(yuanInputToFen("1.234")).toBeUndefined();
    expect(yuanInputToFen("abc")).toBeUndefined();
  });
});

describe("computeFlags", () => {
  it("detects identical files by SHA-256", () => {
    const docs = [makeDoc("a", { hash: "same" }), makeDoc("b", { hash: "same" })];
    const flags = computeFlags(docs, window);
    expect(flags.a.map((flag) => flag.key)).toContain("same-file");
    expect(flags.b.map((flag) => flag.key)).toContain("same-file");
  });

  it("detects the same ticket under the same issuer", () => {
    const fields = {
      ...createEmptyFields(),
      issuer: { value: "某医院", origin: "识别" as const },
      invoiceNumber: { value: "NO-123", origin: "识别" as const },
    };
    const docs = [
      makeDoc("a", { fields }),
      makeDoc("b", { fields: { ...fields } }),
    ];
    const flags = computeFlags(docs, window);
    expect(flags.a.map((flag) => flag.key)).toContain("same-ticket");
  });

  it("detects the same invoice date and amount across different files", () => {
    const base = {
      ...createEmptyFields(),
      invoiceDate: { value: "2026-05-12", origin: "识别" as const },
      amountFen: { value: "1234567", origin: "识别" as const },
    };
    const docs = [
      makeDoc("a", { fields: base }),
      makeDoc("b", { fields: { ...base } }),
    ];
    const flags = computeFlags(docs, window);
    expect(flags.a.map((flag) => flag.key)).toContain("same-amount-date");
  });

  it("marks confirmed documents without an expense date, and dates outside the window", () => {
    const docs = [
      makeDoc("missing", { confirmed: true }),
      makeDoc("outside", {
        confirmed: true,
        fields: {
          ...createEmptyFields(),
          expenseDate: { value: "2026-01-01", origin: "家长填写" },
        },
      }),
    ];
    const flags = computeFlags(docs, window);
    expect(flags.missing.map((flag) => flag.key)).toContain("expense-missing");
    expect(flags.outside.map((flag) => flag.key)).toContain("window-out");
  });
});

describe("computeFlags with an aid rule", () => {
  it("only flags out-of-window dates for document types the rule covers", () => {
    const outside = {
      confirmed: true,
      fields: { ...createEmptyFields(), expenseDate: { value: "2026-01-01", origin: "家长填写" as const } },
    };
    const docs = [
      makeDoc("hospital", { ...outside, archiveType: "住院发票" }),
      makeDoc("drug", { ...outside, archiveType: "外购药票据" }),
    ];
    const flags = computeFlags(docs, {
      ...window,
      applies: (doc) => docInRule(doc, defaultAidRule),
    });
    expect(flags.hospital).toBeUndefined();
    expect(flags.drug.map((flag) => flag.key)).toEqual(["window-out"]);
  });
});
