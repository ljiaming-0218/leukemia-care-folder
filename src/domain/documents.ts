export const archiveTypes = [
  "待分类",
  "住院发票",
  "门诊发票",
  "费用清单",
  "医保结算单",
  "外购药票据",
  "基因检测票据",
  "病历或处方",
  "其他证明材料",
] as const;
export type ArchiveType = (typeof archiveTypes)[number];

export const fieldKeys = [
  "invoiceNumber",
  "issuer",
  "invoiceDate",
  "expenseDate",
  "itemText",
  "amountFen",
] as const;
export type FieldKey = (typeof fieldKeys)[number];

export const fieldLabels: Record<FieldKey, string> = {
  invoiceNumber: "票号",
  issuer: "开具机构",
  invoiceDate: "开票日期",
  expenseDate: "费用发生日期",
  itemText: "项目原文",
  amountFen: "金额",
};

export const amountField = "amountFen" satisfies FieldKey;

export type FieldOrigin = "识别" | "家长填写" | "空";

export type FieldRecord = {
  value: string;
  origin: FieldOrigin;
  page?: number;
  snippet?: string;
};

export type OcrState = "待识别" | "识别中" | "已识别" | "识别失败" | "已取消" | "不支持";

export type LocalDocument = {
  id: string;
  file: File;
  fileName: string;
  mime: string;
  size: number;
  hash: string;
  archiveType: ArchiveType;
  previewKind: "image" | "pdf" | "none";
  previewUrl: string | null;
  ocrState: OcrState;
  progress: number;
  progressLabel?: string;
  pageCount?: number;
  ocrNote?: string;
  error?: string;
  fields: Record<FieldKey, FieldRecord>;
  textByPage?: string[];
  confirmed: boolean;
  dismissedFlags: string[];
};

export type DocFlag = {
  key: string;
  label: string;
  detail: string;
  dismissible: boolean;
};

export function emptyField(): FieldRecord {
  return { value: "", origin: "空" };
}

export function createEmptyFields(): Record<FieldKey, FieldRecord> {
  return {
    invoiceNumber: emptyField(),
    issuer: emptyField(),
    invoiceDate: emptyField(),
    expenseDate: emptyField(),
    itemText: emptyField(),
    amountFen: emptyField(),
  };
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isWithinWindow(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function fenToYuanInput(fen: string): string {
  if (!fen) return "";
  const value = Number(fen);
  if (!Number.isFinite(value)) return "";
  return (value / 100).toFixed(2);
}

export function formatFen(fen: string): string {
  if (!fen) return "未记录";
  const value = Number(fen);
  if (!Number.isFinite(value)) return "未记录";
  return `¥${(value / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function yuanInputToFen(input: string): string | undefined {
  const cleaned = input.trim().replace(/[,，¥￥\s]/g, "");
  if (!cleaned) return "";
  if (!/^\d+(?:\.\d{0,2})?$/.test(cleaned)) return undefined;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return undefined;
  return String(Math.round(value * 100));
}

export function normalizeTicketNumber(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function fileExtension(fileName: string, mime: string): string {
  const match = /\.([A-Za-z0-9]{2,5})$/.exec(fileName);
  if (match) return match[1].toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "bin";
}

export function safeDownloadName(doc: LocalDocument, index: number): string {
  const date =
    doc.fields.expenseDate.value ||
    doc.fields.invoiceDate.value ||
    "日期待核对";
  const prefix = doc.archiveType === "待分类" ? "票据" : doc.archiveType;
  const sequence = String(index + 1).padStart(2, "0");
  return `${prefix}-${date}-${sequence}.${fileExtension(doc.fileName, doc.mime)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function windowStatus(
  doc: LocalDocument,
  rule: { expenseFrom: string; expenseTo: string; shortName: string },
): { label: string; tone: "ok" | "warn" | "muted" } {
  if (!doc.confirmed) return { label: "费用时间待核对", tone: "muted" };
  const date = doc.fields.expenseDate.value;
  if (!isValidIsoDate(date)) return { label: "费用发生时间待核对", tone: "warn" };
  if (!isWithinWindow(date, rule.expenseFrom, rule.expenseTo)) {
    return { label: `${rule.shortName}：窗口外`, tone: "warn" };
  }
  return { label: `${rule.shortName}：窗口内`, tone: "ok" };
}

export function computeFlags(
  docs: LocalDocument[],
  window: { from: string; to: string; name: string; applies: (doc: LocalDocument) => boolean },
): Record<string, DocFlag[]> {
  const result: Record<string, DocFlag[]> = {};
  const push = (id: string, flag: DocFlag) => {
    (result[id] ??= []).push(flag);
  };
  const describeOthers = (docId: string, ids: string[]) =>
    ids
      .filter((id) => id !== docId)
      .map((id) => `第 ${docs.findIndex((doc) => doc.id === id) + 1} 份`)
      .join("、");

  const byHash = new Map<string, string[]>();
  docs.forEach((doc) => {
    byHash.set(doc.hash, [...(byHash.get(doc.hash) ?? []), doc.id]);
  });
  byHash.forEach((ids) => {
    if (ids.length < 2) return;
    ids.forEach((id) =>
      push(id, {
        key: "same-file",
        label: "相同文件",
        detail: `与${describeOthers(id, ids)}的 SHA-256 完全一致。`,
        dismissible: true,
      }),
    );
  });

  const byTicket = new Map<string, string[]>();
  docs.forEach((doc) => {
    const issuer = doc.fields.issuer.value.trim();
    const number = normalizeTicketNumber(doc.fields.invoiceNumber.value);
    if (!issuer || !number) return;
    const key = `${issuer}|${number}`;
    byTicket.set(key, [...(byTicket.get(key) ?? []), doc.id]);
  });
  byTicket.forEach((ids) => {
    if (ids.length < 2) return;
    ids.forEach((id) =>
      push(id, {
        key: "same-ticket",
        label: "疑似同一张票",
        detail: `与${describeOthers(id, ids)}的机构与票号相同，请对照原件确认。`,
        dismissible: true,
      }),
    );
  });

  const byAmountDate = new Map<string, string[]>();
  docs.forEach((doc) => {
    const date = doc.fields.invoiceDate.value;
    const amount = doc.fields.amountFen.value;
    if (!date || !amount) return;
    const key = `${date}|${amount}`;
    byAmountDate.set(key, [...(byAmountDate.get(key) ?? []), doc.id]);
  });
  byAmountDate.forEach((ids) => {
    if (ids.length < 2) return;
    ids.forEach((id) =>
      push(id, {
        key: "same-amount-date",
        label: "同日同金额",
        detail: `与${describeOthers(id, ids)}的开票日期和金额相同，仅作对照提示，不自动合并。`,
        dismissible: true,
      }),
    );
  });

  docs.forEach((doc) => {
    if (!doc.confirmed) return;
    const date = doc.fields.expenseDate.value;
    if (!isValidIsoDate(date)) {
      push(doc.id, {
        key: "expense-missing",
        label: "费用发生时间待核对",
        detail: "这张票没有确认的费用发生日期，暂不能对照救助项目的费用时间段。",
        dismissible: false,
      });
      return;
    }
    if (window.applies(doc) && !isWithinWindow(date, window.from, window.to)) {
      push(doc.id, {
        key: "window-out",
        label: `超出「${window.name}」费用时间段`,
        detail: `费用发生日期 ${date} 不在 ${window.from} 至 ${window.to} 内。原件仍会保留，也可用于医保报销或其他救助。`,
        dismissible: false,
      });
    }
  });

  return result;
}
