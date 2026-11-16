import {
  aidAmountFen,
  amountLabels,
  entryAmountFen,
  entryDateLabel,
  expenseCategories,
  primaryAmountKeys,
  type AmountKey,
  type ExpenseEntry,
} from "./ledger";

export type FundraisingSourceLookup = (entry: ExpenseEntry) => number[];

function yuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

export type SourcedTotal = {
  fen: number;
  count: number;
  docIndexes: number[];
  unlinkedCount: number;
};

function sourcedTotal(
  entries: ExpenseEntry[],
  amount: (entry: ExpenseEntry) => number | null,
  linkedIndexes: FundraisingSourceLookup,
): SourcedTotal {
  const result: SourcedTotal = { fen: 0, count: 0, docIndexes: [], unlinkedCount: 0 };
  const indexes = new Set<number>();
  entries.forEach((entry) => {
    const fen = amount(entry);
    if (fen === null) return;
    result.fen += fen;
    result.count += 1;
    const linked = linkedIndexes(entry);
    if (!linked.length) result.unlinkedCount += 1;
    linked.forEach((index) => indexes.add(index));
  });
  result.docIndexes = [...indexes].sort((a, b) => a - b);
  return result;
}

export function sourceNote(total: SourcedTotal): string {
  const parts = [`覆盖 ${total.count} 笔`];
  if (total.docIndexes.length) parts.push(`对应原件第 ${total.docIndexes.join("、")} 份`);
  if (total.unlinkedCount) parts.push(`其中 ${total.unlinkedCount} 笔原件未关联`);
  return parts.join("，");
}

function line(label: string, total: SourcedTotal): string {
  return `${label}：¥${yuan(total.fen)}（${sourceNote(total)}）`;
}

export function buildFundraisingDraft(
  entries: ExpenseEntry[],
  options: { platformName: string; linkedIndexes: FundraisingSourceLookup },
): string {
  const confirmed = entries.filter((entry) => entry.confirmed);
  const sum = (amount: (entry: ExpenseEntry) => number | null, list = confirmed) =>
    sourcedTotal(list, amount, options.linkedIndexes);
  const byKey = (key: AmountKey) => sum((entry) => entryAmountFen(entry, key));

  const total = byKey("totalFen");
  const amountLines = primaryAmountKeys
    .filter((key) => key !== "totalFen")
    .map((key) => ({ key, total: byKey(key) }))
    .filter((item) => item.total.count > 0)
    .map((item) => line(amountLabels[item.key], item.total));
  const aid = sum(aidAmountFen);

  const categoryLines = expenseCategories
    .map((category) => {
      const list = confirmed.filter((entry) => entry.category === category);
      if (!list.length) return null;
      const categoryTotal = sum((entry) => entryAmountFen(entry, "totalFen"), list);
      return categoryTotal.count
        ? line(category, categoryTotal)
        : `${category}：${list.length} 笔，费用总额未记录`;
    })
    .filter((text): text is string => text !== null);

  const appendix = confirmed.map((entry) => {
    const fen = entryAmountFen(entry, "totalFen");
    const linked = options.linkedIndexes(entry);
    return `第 ${entries.indexOf(entry) + 1} 笔 · ${entry.title || entry.category} · ${entry.category} · ${entryDateLabel(entry)} · 费用总额 ${
      fen === null ? "未记录" : `¥${yuan(fen)}`
    } · ${linked.length ? `原件第 ${linked.join("、")} 份` : "原件未关联"}`;
  });

  return [
    `【筹款说明草稿 · 准备发布到${options.platformName}】`,
    "",
    "一、孩子情况（请家长填写并核对）",
    "年龄：",
    "诊断名称：",
    "目前治疗阶段：",
    "就诊医院类型：",
    "",
    "二、费用情况（来自本站家庭账本，仅统计家长已确认的账目）",
    `已确认账目：${confirmed.length} 笔`,
    total.count ? line("有来源的费用总额", total) : "有来源的费用总额：未记录",
    ...(amountLines.length > 0 ? amountLines : ["医保支付与个人支付：未记录"]),
    aid.count > 0
      ? `${line("已到账公益救助", aid)}，单独记录，不从医疗费用中抵扣`
      : "已到账公益救助：未记录",
    "",
    "三、资金用途（按账本分类合计）",
    ...(categoryLines.length > 0 ? categoryLines : ["账本里还没有已确认的分类账目"]),
    "",
    "四、起止时间与执行方（请家长填写）",
    "募捐开始日期：",
    "募捐结束日期：",
    "发起主体 / 执行方：",
    "剩余款项处理：",
    "",
    "五、隐私与核对",
    "本说明不含姓名、证件号、病历号、联系方式、票据原件、原始文件名和 OCR 全文。",
    "发布前请逐项核对：数字与票据一致，不承诺治疗效果，不写“保证筹到”。",
    "本站只生成草稿，不代为发布、审核或收款；最终以平台表单和审核要求为准。",
    "",
    "附：账目与原件对照（原件序号对应本机「票据导入」页的顺序，原件需按平台要求自行上传）",
    ...(appendix.length ? appendix : ["暂无已确认账目"]),
  ].join("\n");
}
