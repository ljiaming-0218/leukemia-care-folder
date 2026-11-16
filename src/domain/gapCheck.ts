import { aidAmountFen, entryAmountFen, type ExpenseEntry } from "./ledger";

export type GapHintId =
  | "no-pooling"
  | "no-critical-illness"
  | "cash-no-assistance"
  | "drug-dual-channel"
  | "charity-scope";

export type GapHint = {
  id: GapHintId;
  title: string;
  why: string;
  questions: string[];
  askWho: string;
  resourceIds: string[];
  entries: { entry: ExpenseEntry; entryNumber: number }[];
};

type Rule = Omit<GapHint, "entries"> & { match: (entry: ExpenseEntry) => boolean };

const isVisit = (entry: ExpenseEntry) => entry.category === "住院" || entry.category === "门诊";
const has = (entry: ExpenseEntry, key: Parameters<typeof entryAmountFen>[1]) =>
  entryAmountFen(entry, key) !== null;

const rules: Rule[] = [
  {
    id: "no-pooling",
    title: "这几笔就诊没有记录医保统筹支付",
    why: "账目记了费用总额，但没有基本医保统筹支付。可能只是结算单还没录入，也可能当时没有走医保结算，例如异地就医未备案。没有直接结算的费用，通常还可以回参保地手工报销。",
    questions: [
      "这次就诊有没有用医保结算？",
      "没有直接结算的，回参保地手工报销要哪些材料，多久内要办？",
    ],
    askWho: "医院医保窗口或参保地医保经办机构",
    resourceIds: ["national-resident-insurance", "cross-province-settlement"],
    match: (entry) => isVisit(entry) && has(entry, "totalFen") && !has(entry, "poolingFen"),
  },
  {
    id: "no-critical-illness",
    title: "有统筹支付，但没有大病保险支付",
    why: "大病保险在基本医保结算后，对个人负担的合规费用再支付，有起付线。单次费用不高时没有大病保险支付是正常的；多次住院累计后可能达到，值得问一下今年的累计情况。",
    questions: [
      "孩子今年的大病保险累计到哪了，这几次有没有计入？",
      "大病保险是随结算自动支付，还是需要单独申请？",
    ],
    askWho: "医院医保窗口或参保地医保经办机构",
    resourceIds: ["national-critical-illness"],
    match: (entry) => isVisit(entry) && has(entry, "poolingFen") && !has(entry, "criticalIllnessFen"),
  },
  {
    id: "cash-no-assistance",
    title: "有个人现金支付，没有医疗救助支付",
    why: "医疗救助面向经认定的困难家庭，需要先认定、再单独申请，不会自动发放。如果家庭属于低保、特困、低保边缘或因病致贫等情况，可以问能不能申请。",
    questions: [
      "我家能不能做困难身份认定，找哪个部门？",
      "已经发生的这些费用能不能申请医疗救助，要先完成哪些结算？",
    ],
    askWho: "乡镇（街道）、民政部门或医保经办机构",
    resourceIds: ["national-medical-assistance"],
    match: (entry) => has(entry, "cashFen") && !has(entry, "assistanceFen"),
  },
  {
    id: "drug-dual-channel",
    title: "外购药没有医保支付记录",
    why: "院外买的药常按全自费处理。如果它属于国家医保谈判药品，并被参保地纳入「双通道」管理，在定点药店买也可能按医保政策支付。",
    questions: [
      "这个药是不是国家医保谈判药品，参保地有没有纳入「双通道」？",
      "可以去哪几家定点药店买，已经自费买过的能不能补报？",
    ],
    askWho: "开药医生、医院医保窗口或参保地医保经办机构",
    resourceIds: ["national-dual-channel"],
    match: (entry) => entry.category === "外购药" && !has(entry, "poolingFen"),
  },
  {
    id: "charity-scope",
    title: "外购药、基因检测还没有公益救助到账",
    why: "有些公益项目在公告里明确写出资助目录外自费药或基因检测等费用，例如景宁第五期「小鹿灯」。各地项目、条件和费用时间段不同，可以问问有没有适合你家的。",
    questions: [
      "本地或治疗医院有没有资助外购药、基因检测的公益项目？",
      "申请要求的费用发生时间段是哪段，要哪些票据和明细？",
    ],
    askWho: "治疗医院的医务社工、当地红十字会或项目官方入口",
    resourceIds: ["national-xiaotianshi", "jingning-xiaoludeng-phase5"],
    match: (entry) =>
      (entry.category === "外购药" || entry.category === "基因检测") && aidAmountFen(entry) === null,
  },
];

export function findGapHints(entries: ExpenseEntry[]): GapHint[] {
  const numbered = entries.map((entry, index) => ({ entry, entryNumber: index + 1 }));
  return rules
    .map(({ match, ...rule }) => ({
      ...rule,
      entries: numbered.filter(({ entry }) => entry.confirmed && match(entry)),
    }))
    .filter((hint) => hint.entries.length > 0);
}

export function gapHintsText(hints: GapHint[]): string {
  if (hints.length === 0) return "账本里已确认的账目暂时没有触发查漏提醒。";
  return [
    "就医费用查漏：可以去问的问题（只是提醒，不代表一定能报或能申请）",
    ...hints.map((hint, index) =>
      [
        `${index + 1}. ${hint.title}（第 ${hint.entries.map((item) => item.entryNumber).join("、")} 笔）`,
        `去问：${hint.askWho}`,
        ...hint.questions.map((question) => `- ${question}`),
      ].join("\n"),
    ),
  ].join("\n\n");
}
