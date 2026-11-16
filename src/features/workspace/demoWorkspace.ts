import {
  createEmptyFields,
  type ArchiveType,
  type FieldKey,
  type LocalDocument,
} from "@/src/domain/documents";
import {
  aidStatuses,
  createEmptyAid,
  createEmptyAmounts,
  type AmountRecord,
  type ExpenseEntry,
} from "@/src/domain/ledger";
import type { MaterialState } from "@/src/domain/schemas";
import { sha256File } from "@/src/document/sha256";

export const demoDocumentIds = {
  hospitalInvoice: "demo-doc-hospital-invoice",
  settlement: "demo-doc-settlement",
  drugReceipt: "demo-doc-drug-receipt",
  geneTest: "demo-doc-gene-test",
} as const;

type DemoAsset = {
  id: string;
  file: string;
  archiveType: ArchiveType;
  fields: Record<FieldKey, string>;
};

const demoAssets: DemoAsset[] = [
  {
    id: demoDocumentIds.hospitalInvoice,
    file: "hospital-invoice.png",
    archiveType: "住院发票",
    fields: {
      invoiceNumber: "20260512000123",
      issuer: "景宁畲族自治县人民医院（虚构）",
      invoiceDate: "2026-05-12",
      expenseDate: "2026-05-12",
      itemText: "住院西药费",
      amountFen: "1234567",
    },
  },
  {
    id: demoDocumentIds.settlement,
    file: "settlement.png",
    archiveType: "医保结算单",
    fields: {
      invoiceNumber: "JS2026051200456",
      issuer: "景宁畲族自治县人民医院（虚构）",
      invoiceDate: "2026-05-12",
      expenseDate: "2026-05-12",
      itemText: "住院医保结算（医保统筹、大病保险、个人账户与现金）",
      amountFen: "1234567",
    },
  },
  {
    id: demoDocumentIds.drugReceipt,
    file: "drug-receipt.png",
    archiveType: "外购药票据",
    fields: {
      invoiceNumber: "20260520009988",
      issuer: "景宁惠民大药房（虚构）",
      invoiceDate: "2026-05-20",
      expenseDate: "2026-05-20",
      itemText: "外购药 泊沙康唑肠溶片",
      amountFen: "328000",
    },
  },
  {
    id: demoDocumentIds.geneTest,
    file: "gene-test.png",
    archiveType: "基因检测票据",
    fields: {
      invoiceNumber: "20260601007777",
      issuer: "杭州明理医学检验实验室（虚构）",
      invoiceDate: "2026-06-01",
      expenseDate: "2026-06-03",
      itemText: "基因检测 血液肿瘤相关基因",
      amountFen: "860000",
    },
  },
];

function assetUrl(file: string): string {
  return new URL(`${import.meta.env.BASE_URL}demo/${file}`, document.baseURI).href;
}

function demoFields(values: Record<FieldKey, string>) {
  const fields = createEmptyFields();
  (Object.keys(values) as FieldKey[]).forEach((key) => {
    fields[key] = {
      value: values[key],
      origin: "识别",
      page: 1,
    };
  });
  return fields;
}

async function loadDocument(asset: DemoAsset): Promise<LocalDocument> {
  const response = await fetch(assetUrl(asset.file));
  if (!response.ok) {
    throw new Error(`演示原件加载失败（${asset.file}）`);
  }
  const blob = await response.blob();
  const file = new File([blob], `演示-${asset.archiveType}.png`, { type: "image/png" });
  return {
    id: asset.id,
    file,
    fileName: file.name,
    mime: file.type,
    size: file.size,
    hash: await sha256File(file),
    archiveType: asset.archiveType,
    previewKind: "image",
    previewUrl: URL.createObjectURL(file),
    ocrState: "已识别",
    progress: 1,
    pageCount: 1,
    fields: demoFields(asset.fields),
    confirmed: true,
    dismissedFlags: ["same-amount-date"],
  };
}

function amount(value: string, status: AmountRecord["status"]): AmountRecord {
  return { value, status };
}

function buildDemoEntries(): ExpenseEntry[] {
  const hospitalAmounts = createEmptyAmounts();
  hospitalAmounts.totalFen = amount("1234567", "原件明确");
  hospitalAmounts.poolingFen = amount("800000", "原件明确");
  hospitalAmounts.criticalIllnessFen = amount("100000", "原件明确");
  hospitalAmounts.personalAccountFen = amount("134567", "原件明确");
  hospitalAmounts.cashFen = amount("200000", "原件明确");

  const drugAmounts = createEmptyAmounts();
  drugAmounts.totalFen = amount("328000", "家长核对");

  const geneAmounts = createEmptyAmounts();
  geneAmounts.totalFen = amount("860000", "家长核对");

  const geneAid = createEmptyAid();
  geneAid.value = "500000";
  geneAid.status = aidStatuses[1];
  geneAid.note = "演示虚构到账记录，只展示救助与费用分开展示。";

  return [
    {
      id: "demo-entry-hospital",
      title: "2026 年 5 月住院（演示）",
      category: "住院",
      expenseDate: "2026-05-12",
      dateStatus: "已确认",
      documentIds: [demoDocumentIds.hospitalInvoice, demoDocumentIds.settlement],
      sourceIndexes: [1, 2],
      amounts: hospitalAmounts,
      aid: createEmptyAid(),
      note: "住院发票与同次医保结算单归入一笔；支付金额取自演示结算单票面。",
      confirmed: true,
    },
    {
      id: "demo-entry-drug",
      title: "外购药 · 泊沙康唑（演示）",
      category: "外购药",
      expenseDate: "2026-05-20",
      dateStatus: "已确认",
      documentIds: [demoDocumentIds.drugReceipt],
      sourceIndexes: [3],
      amounts: drugAmounts,
      aid: createEmptyAid(),
      note: "演示票面只确认总额，支付方式未分项，保持未记录，不补零。",
      confirmed: true,
    },
    {
      id: "demo-entry-gene",
      title: "基因检测（演示）",
      category: "基因检测",
      expenseDate: "2026-06-03",
      dateStatus: "已确认",
      documentIds: [demoDocumentIds.geneTest],
      sourceIndexes: [4],
      amounts: geneAmounts,
      aid: geneAid,
      note: "开票日期为 2026-06-01，费用发生日期为 2026-06-03，按费用发生日期计入。",
      confirmed: true,
    },
  ];
}

export type DemoWorkspace = {
  docs: LocalDocument[];
  entries: ExpenseEntry[];
  prepareStates: Record<string, MaterialState>;
  prepareLinks: Record<string, string[]>;
};

export async function buildDemoWorkspace(): Promise<DemoWorkspace> {
  const docs = await Promise.all(demoAssets.map(loadDocument));
  return {
    docs,
    entries: buildDemoEntries(),
    prepareStates: {
      "m-applied-receipts": "已准备",
      "m-diagnosis": "待确认",
      "m-detail": "待确认",
      "m-identity": "未准备",
      "m-reimbursement": "已准备",
    },
    prepareLinks: {
      "m-applied-receipts": [demoDocumentIds.drugReceipt, demoDocumentIds.geneTest],
      "m-reimbursement": [demoDocumentIds.settlement],
    },
  };
}
