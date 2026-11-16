import { z } from "zod";
import { isValidIsoDate, type LocalDocument } from "./documents";

export const expenseCategories = ["住院", "门诊", "外购药", "基因检测", "待分类"] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];

export const amountKeys = [
  "totalFen",
  "poolingFen",
  "criticalIllnessFen",
  "assistanceFen",
  "personalAccountFen",
  "cashFen",
  "selfPayFen",
  "selfExpenseFen",
  "otherPaymentFen",
] as const;
export type AmountKey = (typeof amountKeys)[number];

export const amountLabels: Record<AmountKey, string> = {
  totalFen: "费用总额",
  poolingFen: "基本医保统筹支付",
  criticalIllnessFen: "大病保险支付",
  assistanceFen: "医疗救助支付",
  personalAccountFen: "个人账户支付",
  cashFen: "个人现金支付",
  selfPayFen: "个人自付（票面原标签）",
  selfExpenseFen: "个人自费（票面原标签）",
  otherPaymentFen: "其他支付（票面原标签）",
};

export const primaryAmountKeys: AmountKey[] = [
  "totalFen",
  "poolingFen",
  "criticalIllnessFen",
  "assistanceFen",
  "personalAccountFen",
  "cashFen",
];

export const faceAmountKeys: AmountKey[] = ["selfPayFen", "selfExpenseFen", "otherPaymentFen"];

export const amountStatuses = ["未记录", "原件明确", "家长核对"] as const;
export type AmountStatus = (typeof amountStatuses)[number];

export type AmountRecord = {
  value: string;
  status: AmountStatus;
};

export const aidStatuses = ["未记录", "已到账"] as const;
export type AidStatus = (typeof aidStatuses)[number];

export type AidRecord = {
  value: string;
  status: AidStatus;
  note: string;
};

export const dateStatuses = ["已确认", "待核对"] as const;
export type DateStatus = (typeof dateStatuses)[number];

export type ExpenseEntry = {
  id: string;
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  dateStatus: DateStatus;
  documentIds: string[];
  sourceIndexes: number[];
  amounts: Record<AmountKey, AmountRecord>;
  aid: AidRecord;
  note: string;
  confirmed: boolean;
};

export const unknownMonthLabel = "日期待核对";

const amountValueSchema = z
  .string()
  .regex(/^\d{0,12}$/, "金额必须是非负整数分，最多 12 位");

const amountRecordSchema = z
  .object({
    value: amountValueSchema,
    status: z.enum(amountStatuses),
  })
  .superRefine((record, ctx) => {
    if (record.value === "" && record.status !== "未记录") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "没有金额时应为「未记录」" });
    }
    if (record.value !== "" && record.status === "未记录") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "填写金额后需标明来源状态" });
    }
  });

const amountsSchema = z.object(
  Object.fromEntries(amountKeys.map((key) => [key, amountRecordSchema])) as Record<
    AmountKey,
    typeof amountRecordSchema
  >,
);

const aidSchema = z
  .object({
    value: amountValueSchema,
    status: z.enum(aidStatuses),
    note: z.string().max(200),
  })
  .superRefine((aid, ctx) => {
    if (aid.value === "" && aid.status !== "未记录") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "没有救助金额时应为「未记录」" });
    }
    if (aid.value !== "" && aid.status === "未记录") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "填写到账金额后需选择「已到账」" });
    }
  });

const datePair = (
  entry: { expenseDate: string; dateStatus: DateStatus },
  ctx: z.RefinementCtx,
) => {
  if (entry.expenseDate !== "" && !isValidIsoDate(entry.expenseDate)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "费用发生日期必须是 YYYY-MM-DD" });
  }
  if (entry.dateStatus === "已确认" && entry.expenseDate === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "已确认的日期不能为空" });
  }
};

export const ledgerBackupEntrySchema = z
  .object({
    title: z.string().max(80),
    category: z.enum(expenseCategories),
    expenseDate: z.string().max(10),
    dateStatus: z.enum(dateStatuses),
    sourceIndexes: z.array(z.number().int().min(1).max(9999)).max(20),
    amounts: amountsSchema,
    aid: aidSchema,
    note: z.string().max(500),
    confirmed: z.boolean(),
  })
  .superRefine(datePair);

export const ledgerBackupSchema = z.object({
  app: z.literal("儿童白血病就医资料夹"),
  schemaVersion: z.literal(1),
  mode: z.enum(["real", "demo"]),
  exportedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/),
  ruleId: z.string().max(80).optional(),
  entries: z.array(ledgerBackupEntrySchema).min(1).max(500),
});

export type LedgerBackup = z.infer<typeof ledgerBackupSchema>;
export type LedgerBackupEntry = z.infer<typeof ledgerBackupEntrySchema>;

export function createEmptyAmounts(): Record<AmountKey, AmountRecord> {
  return Object.fromEntries(
    amountKeys.map((key) => [key, { value: "", status: "未记录" as AmountStatus }]),
  ) as Record<AmountKey, AmountRecord>;
}

export function createEmptyAid(): AidRecord {
  return { value: "", status: "未记录", note: "" };
}

export function entryMonthKey(entry: ExpenseEntry): string {
  if (entry.dateStatus !== "已确认" || !isValidIsoDate(entry.expenseDate)) {
    return unknownMonthLabel;
  }
  return entry.expenseDate.slice(0, 7);
}

export function entryDateLabel(entry: ExpenseEntry): string {
  if (entry.dateStatus !== "已确认" || !isValidIsoDate(entry.expenseDate)) {
    return unknownMonthLabel;
  }
  return entry.expenseDate;
}

export function entryHasSource(entry: ExpenseEntry): boolean {
  return entry.documentIds.length > 0 || entry.sourceIndexes.length > 0;
}

export function entryNeedsOriginals(entry: ExpenseEntry): boolean {
  return entry.documentIds.length === 0 && entry.sourceIndexes.length > 0;
}

export function entryAmountFen(entry: ExpenseEntry, key: AmountKey): number | null {
  const record = entry.amounts[key];
  if (record.status === "未记录" || record.value === "") return null;
  const value = Number(record.value);
  return Number.isFinite(value) ? value : null;
}

export function aidAmountFen(entry: ExpenseEntry): number | null {
  if (entry.aid.status === "未记录" || entry.aid.value === "") return null;
  const value = Number(entry.aid.value);
  return Number.isFinite(value) ? value : null;
}

export type AmountSummary = { fen: number; count: number };

export type LedgerSummary = {
  entryCount: number;
  amounts: Record<AmountKey, AmountSummary>;
  aid: AmountSummary;
};

export function summarizeEntries(entries: ExpenseEntry[]): LedgerSummary {
  const counted = entries.filter((entry) => entry.confirmed);
  const amounts = Object.fromEntries(
    amountKeys.map((key) => [key, { fen: 0, count: 0 }]),
  ) as Record<AmountKey, AmountSummary>;
  let aid: AmountSummary = { fen: 0, count: 0 };
  counted.forEach((entry) => {
    amountKeys.forEach((key) => {
      const fen = entryAmountFen(entry, key);
      if (fen === null) return;
      amounts[key].fen += fen;
      amounts[key].count += 1;
    });
    const aidFen = aidAmountFen(entry);
    if (aidFen !== null) aid = { fen: aid.fen + aidFen, count: aid.count + 1 };
  });
  return { entryCount: counted.length, amounts, aid };
}

export type MonthRow = {
  month: string;
  entryCount: number;
  amounts: Record<AmountKey, AmountSummary>;
  aid: AmountSummary;
};

export function summarizeByMonth(entries: ExpenseEntry[]): MonthRow[] {
  const counted = entries.filter((entry) => entry.confirmed);
  const groups = new Map<string, ExpenseEntry[]>();
  counted.forEach((entry) => {
    const key = entryMonthKey(entry);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });
  const rows = Array.from(groups.entries()).map(([month, list]) => {
    const summary = summarizeEntries(list);
    return {
      month,
      entryCount: summary.entryCount,
      amounts: summary.amounts,
      aid: summary.aid,
    };
  });
  return rows.sort((a, b) => {
    if (a.month === unknownMonthLabel) return 1;
    if (b.month === unknownMonthLabel) return -1;
    return b.month.localeCompare(a.month);
  });
}

export type CategoryRow = {
  category: ExpenseCategory;
  entryCount: number;
  total: AmountSummary;
};

export function summarizeByCategory(entries: ExpenseEntry[]): CategoryRow[] {
  const counted = entries.filter((entry) => entry.confirmed);
  return expenseCategories
    .map((category) => {
      const list = counted.filter((entry) => entry.category === category);
      return { category, entryCount: list.length, total: summarizeEntries(list).amounts.totalFen };
    })
    .filter((row) => row.entryCount > 0);
}

export function nearMatchReasons(entry: ExpenseEntry, doc: LocalDocument): string[] {
  const reasons: string[] = [];
  if (
    entry.dateStatus === "已确认" &&
    entry.expenseDate &&
    doc.fields.expenseDate.value === entry.expenseDate
  ) {
    reasons.push("费用日期相同");
  }
  const total = entryAmountFen(entry, "totalFen");
  const docAmount = Number(doc.fields.amountFen.value || "0");
  if (total !== null && docAmount > 0 && docAmount === total) reasons.push("金额相同");
  return reasons;
}

export function inferCategoryFromDocs(docs: LocalDocument[]): ExpenseCategory {
  if (!docs.length) return "待分类";
  const mapped = docs.map((doc): ExpenseCategory => {
    switch (doc.archiveType) {
      case "住院发票":
      case "费用清单":
      case "医保结算单":
        return "住院";
      case "门诊发票":
        return "门诊";
      case "外购药票据":
        return "外购药";
      case "基因检测票据":
        return "基因检测";
      default:
        return "待分类";
    }
  });
  const first = mapped[0];
  return mapped.every((category) => category === first) ? first : "待分类";
}

export function commonExpenseDate(docs: LocalDocument[]): string {
  const dates = docs
    .map((doc) => doc.fields.expenseDate.value)
    .filter((date) => isValidIsoDate(date));
  if (dates.length !== docs.length || dates.length === 0) return "";
  return dates.every((date) => date === dates[0]) ? dates[0] : "";
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function yuanCell(fen: number): string {
  return (fen / 100).toFixed(2);
}

function recordCell(record: AmountRecord): string {
  if (record.status === "未记录" || record.value === "") return "";
  return yuanCell(Number(record.value));
}

export function buildLedgerCsv(
  entries: ExpenseEntry[],
  options: {
    today: string;
    sourceLabel: (entry: ExpenseEntry) => string;
    workspaceLabel?: string;
  },
): string {
  const confirmed = entries.filter((entry) => entry.confirmed);
  const lines: string[] = [
    "儿童白血病就医资料夹 · 家庭费用整理表",
    `导出日期,${options.today}`,
    ...(options.workspaceLabel ? [`工作区,${options.workspaceLabel}`] : []),
    "统计口径,仅汇总家长已确认的账目；金额单位为元；未记录的项目留空，不补零；支付项目之间不做推算或相互替代。",
    "来源说明,「关联原件序号」对应当前浏览器会话中的票据顺序；原件未随本表导出，请另行保存。",
    "隐私说明,本表不含姓名、证件号、联系方式和报告正文。",
    "",
  ];
  const header = [
    "序号",
    "账目标题",
    "类别",
    "费用发生日期",
    "日期状态",
    "关联原件序号",
    ...amountKeys.map((key) => `${amountLabels[key]}(元)`),
    "已到账公益救助(元)",
    "救助备注",
    "备注",
  ];
  lines.push(header.map(csvCell).join(","));
  confirmed.forEach((entry, index) => {
    const row = [
      String(index + 1),
      entry.title,
      entry.category,
      entry.expenseDate || "",
      entry.dateStatus,
      options.sourceLabel(entry),
      ...amountKeys.map((key) => recordCell(entry.amounts[key])),
      entry.aid.status === "已到账" && entry.aid.value ? yuanCell(Number(entry.aid.value)) : "",
      entry.aid.note,
      entry.note,
    ];
    lines.push(row.map(csvCell).join(","));
  });
  if (!confirmed.length) {
    lines.push("本账本还没有已确认的账目，未导出金额行。");
  }
  return lines.join("\r\n");
}

export function buildSummaryText(
  entries: ExpenseEntry[],
  sourceLabel: (entry: ExpenseEntry) => string,
): string {
  const confirmed = entries.filter((entry) => entry.confirmed);
  const summary = summarizeEntries(confirmed);
  const lines: string[] = [
    "儿童白血病就医资料夹 · 家庭费用整理清单",
    "口径：仅含家长已确认的账目；未记录的项目不补零；支付项目不做推算。",
    "",
  ];
  if (!confirmed.length) {
    lines.push("本账本还没有已确认的账目。");
  }
  confirmed.forEach((entry, index) => {
    lines.push(
      `${index + 1}. ${entry.title || entry.category} · ${entry.category} · ${entryDateLabel(entry)}`,
    );
    lines.push(`   来源原件：${sourceLabel(entry) || "原件未关联"}`);
    const total = entryAmountFen(entry, "totalFen");
    lines.push(`   费用总额：${total === null ? "未记录" : `¥${yuanCell(total)}`}`);
    primaryAmountKeys
      .filter((key) => key !== "totalFen")
      .forEach((key) => {
        const fen = entryAmountFen(entry, key);
        if (fen !== null) lines.push(`   ${amountLabels[key]}：¥${yuanCell(fen)}`);
      });
    faceAmountKeys.forEach((key) => {
      const fen = entryAmountFen(entry, key);
      if (fen !== null) lines.push(`   ${amountLabels[key]}：¥${yuanCell(fen)}`);
    });
    const aid = aidAmountFen(entry);
    if (aid !== null) lines.push(`   已到账公益救助：¥${yuanCell(aid)}`);
    if (entry.note) lines.push(`   备注：${entry.note}`);
    lines.push("");
  });
  if (confirmed.length) {
    lines.push(`合计（${summary.entryCount} 笔已确认账目）`);
    const total = summary.amounts.totalFen;
    lines.push(`费用总额：${total.count ? `¥${yuanCell(total.fen)}（覆盖 ${total.count} 笔）` : "未记录"}`);
    primaryAmountKeys
      .filter((key) => key !== "totalFen")
      .forEach((key) => {
        const amount = summary.amounts[key];
        if (amount.count) lines.push(`${amountLabels[key]}：¥${yuanCell(amount.fen)}（覆盖 ${amount.count} 笔）`);
      });
    faceAmountKeys.forEach((key) => {
      const amount = summary.amounts[key];
      if (amount.count) lines.push(`${amountLabels[key]}：¥${yuanCell(amount.fen)}（覆盖 ${amount.count} 笔）`);
    });
    if (summary.aid.count) {
      lines.push(`已到账公益救助：¥${yuanCell(summary.aid.fen)}（覆盖 ${summary.aid.count} 笔）`);
    }
  }
  lines.push("说明：本清单由家庭自行整理，不代表任何机构的审核结果。");
  return lines.join("\n");
}

export function createBackup(
  entries: ExpenseEntry[],
  options: {
    exportedAt: string;
    ruleId?: string;
    mode: "real" | "demo";
    sourceIndexes: (entry: ExpenseEntry) => number[];
  },
): LedgerBackup {
  const confirmed = entries.filter((entry) => entry.confirmed);
  return {
    app: "儿童白血病就医资料夹",
    schemaVersion: 1,
    mode: options.mode,
    exportedAt: options.exportedAt,
    ruleId: options.ruleId,
    entries: confirmed.map((entry) => ({
      title: entry.title,
      category: entry.category,
      expenseDate: entry.expenseDate,
      dateStatus: entry.dateStatus,
      sourceIndexes: options.sourceIndexes(entry),
      amounts: Object.fromEntries(
        amountKeys.map((key) => [key, { ...entry.amounts[key] }]),
      ) as LedgerBackupEntry["amounts"],
      aid: { ...entry.aid },
      note: entry.note,
      confirmed: entry.confirmed,
    })),
  };
}

export function backupToEntries(backup: LedgerBackup): ExpenseEntry[] {
  return backup.entries.map((entry) => ({
    id: crypto.randomUUID(),
    title: entry.title,
    category: entry.category,
    expenseDate: entry.expenseDate,
    dateStatus: entry.dateStatus,
    documentIds: [],
    sourceIndexes: [...entry.sourceIndexes],
    amounts: Object.fromEntries(
      amountKeys.map((key) => [key, { ...entry.amounts[key] }]),
    ) as Record<AmountKey, AmountRecord>,
    aid: { ...entry.aid },
    note: entry.note,
    confirmed: entry.confirmed,
  }));
}
