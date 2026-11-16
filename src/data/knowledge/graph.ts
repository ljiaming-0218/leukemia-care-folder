import { z } from "zod";
import { glossaryEntries } from "@/src/data/knowledge/glossary";

const graphEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().min(1),
});

export type KnowledgeGraphEdge = z.infer<typeof graphEdgeSchema>;

const rawEdges: KnowledgeGraphEdge[] = [
  { from: "leukemia", to: "all", label: "常见分型" },
  { from: "leukemia", to: "aml", label: "常见分型" },
  { from: "aml", to: "apl", label: "特殊亚型" },
  { from: "all", to: "risk-stratification", label: "危险度分层" },
  { from: "all", to: "remission", label: "治疗目标" },
  { from: "remission", to: "relapse", label: "可能复发" },
  { from: "leukemia", to: "bone-marrow-aspiration", label: "确诊检查" },
  { from: "bone-marrow-aspiration", to: "immunophenotype", label: "标本送检" },
  { from: "bone-marrow-aspiration", to: "karyotype", label: "标本送检" },
  { from: "karyotype", to: "fusion-gene", label: "分子检测" },
  { from: "immunophenotype", to: "mrd", label: "检测基础" },
  { from: "fusion-gene", to: "mrd", label: "检测基础" },
  { from: "leukemia", to: "lumbar-puncture", label: "中枢检查" },
  { from: "lumbar-puncture", to: "intrathecal", label: "鞘内给药" },
  { from: "blood-count", to: "myelosuppression", label: "血细胞变化" },
  { from: "blood-count", to: "febrile-neutropenia", label: "感染预警" },
  { from: "induction", to: "remission", label: "阶段目标" },
  { from: "induction", to: "consolidation", label: "阶段顺序" },
  { from: "consolidation", to: "maintenance", label: "阶段顺序" },
  { from: "induction", to: "glucocorticoid", label: "常用药" },
  { from: "consolidation", to: "methotrexate", label: "常用药" },
  { from: "maintenance", to: "methotrexate", label: "维持用药" },
  { from: "apl", to: "atra", label: "特殊亚型用药" },
  { from: "induction", to: "central-line", label: "输液通路" },
  { from: "myelosuppression", to: "febrile-neutropenia", label: "感染风险" },
  { from: "resident-insurance", to: "critical-illness-insurance", label: "补充支付" },
  { from: "critical-illness-insurance", to: "medical-assistance", label: "托底" },
  { from: "resident-insurance", to: "out-of-catalog", label: "目录外自费" },
  { from: "settlement-slip", to: "resident-insurance", label: "结算记录" },
  { from: "e-invoice", to: "settlement-slip", label: "费用凭证" },
  { from: "e-invoice", to: "invoice-number", label: "票面字段" },
  { from: "induction", to: "settlement-slip", label: "产生费用" },
  { from: "out-of-catalog", to: "settlement-slip", label: "自费单列" },
  { from: "mrd", to: "maintenance", label: "复查节点" },
];

export const knowledgeGraphEdges = z.array(graphEdgeSchema).parse(rawEdges);

const graphPathSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).min(3),
  pairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(2),
});

export type KnowledgeGraphPath = z.infer<typeof graphPathSchema>;

export const knowledgeGraphPaths: KnowledgeGraphPath[] = z.array(graphPathSchema).parse([
  {
    id: "new-diagnosis",
    title: "刚确诊",
    description: "先弄清诊断和检查报告，知道每份结果在回答什么问题，不急着比较治疗方案。",
    nodeIds: ["leukemia", "bone-marrow-aspiration", "immunophenotype", "karyotype", "fusion-gene"],
    pairs: [
      ["leukemia", "bone-marrow-aspiration"],
      ["bone-marrow-aspiration", "immunophenotype"],
      ["bone-marrow-aspiration", "karyotype"],
      ["karyotype", "fusion-gene"],
    ],
  },
  {
    id: "follow-up",
    title: "复诊前",
    description: "把分型、危险度、复查指标和维持治疗连起来，带着具体问题去复诊。",
    nodeIds: ["all", "risk-stratification", "remission", "mrd", "maintenance"],
    pairs: [
      ["all", "risk-stratification"],
      ["all", "remission"],
      ["mrd", "maintenance"],
    ],
  },
  {
    id: "costs",
    title: "费用与材料",
    description: "从票面字段到结算单，再看医保支付和目录外自费，弄清每个数字来自哪里。",
    nodeIds: ["e-invoice", "invoice-number", "settlement-slip", "resident-insurance", "out-of-catalog"],
    pairs: [
      ["e-invoice", "invoice-number"],
      ["e-invoice", "settlement-slip"],
      ["settlement-slip", "resident-insurance"],
      ["resident-insurance", "out-of-catalog"],
      ["out-of-catalog", "settlement-slip"],
    ],
  },
]);

export const knowledgeGraphNodeIds = [
  "leukemia",
  "all",
  "aml",
  "apl",
  "risk-stratification",
  "remission",
  "relapse",
  "bone-marrow-aspiration",
  "immunophenotype",
  "karyotype",
  "fusion-gene",
  "mrd",
  "lumbar-puncture",
  "blood-count",
  "induction",
  "consolidation",
  "maintenance",
  "intrathecal",
  "central-line",
  "myelosuppression",
  "febrile-neutropenia",
  "glucocorticoid",
  "methotrexate",
  "atra",
  "resident-insurance",
  "critical-illness-insurance",
  "medical-assistance",
  "settlement-slip",
  "e-invoice",
  "invoice-number",
  "out-of-catalog",
] as const;

const glossaryIds = new Set(glossaryEntries.map((entry) => entry.id));
const missingNodeIds = knowledgeGraphNodeIds.filter((id) => !glossaryIds.has(id));
if (missingNodeIds.length > 0) {
  throw new Error(`知识图谱引用了不存在的术语：${missingNodeIds.join("、")}`);
}

const missingEdgeIds = knowledgeGraphEdges
  .flatMap((edge) => [edge.from, edge.to])
  .filter((id) => !glossaryIds.has(id));
if (missingEdgeIds.length > 0) {
  throw new Error(`知识图谱关系引用了不存在的术语：${[...new Set(missingEdgeIds)].join("、")}`);
}

const edgeKeys = new Set(knowledgeGraphEdges.map((edge) => `${edge.from}->${edge.to}`));
const invalidPathNodes = knowledgeGraphPaths.flatMap((path) =>
  path.nodeIds.filter((id) => !glossaryIds.has(id)),
);
if (invalidPathNodes.length > 0) {
  throw new Error(`知识图谱路径引用了不存在的术语：${[...new Set(invalidPathNodes)].join("、")}`);
}

const invalidPathPairs = knowledgeGraphPaths.flatMap((path) =>
  path.pairs
    .map(([from, to]) => `${from}->${to}`)
    .filter((key) => !edgeKeys.has(key)),
);
if (invalidPathPairs.length > 0) {
  throw new Error(`知识图谱路径引用了不存在的关系：${[...new Set(invalidPathPairs)].join("、")}`);
}
