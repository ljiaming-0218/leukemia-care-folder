import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD");

export const knowledgeTopicSchema = z.enum(["刚确诊", "治疗与复诊", "费用与资料"]);
export type KnowledgeTopic = z.infer<typeof knowledgeTopicSchema>;

const linkTargetSchema = z
  .string()
  .regex(/^\/(learn|route|receipts|ledger|check|prepare|about)(?:[/?#]|$)/, "站内链接须指向本站已有页面");

export const knowledgeDetailSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).default([]),
  bullets: z.array(z.string().min(1)).default([]),
});

export type KnowledgeDetail = z.infer<typeof knowledgeDetailSchema>;

export const glossaryGroupSchema = z.enum([
  "疾病与分型",
  "检查与报告",
  "治疗与护理",
  "用药",
  "费用与票据",
]);

export type GlossaryGroup = z.infer<typeof glossaryGroupSchema>;

export const glossaryEntrySchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  aka: z.array(z.string().min(1)).default([]),
  group: glossaryGroupSchema,
  plain: z.string().min(1),
  detail: z.string().optional(),
  caution: z.string().optional(),
  entryId: z.string().optional(),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  verifiedAt: isoDateSchema,
});

export const glossaryEntriesSchema = z.array(glossaryEntrySchema).min(1);
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

export const knowledgeCardSchema = z
  .object({
    id: z.string().min(1),
    topic: knowledgeTopicSchema,
    title: z.string().min(1),
    summary: z.string().min(1),
    details: z.array(knowledgeDetailSchema).default([]),
    action: z.object({
      kind: z.enum(["copy", "link"]),
      label: z.string().min(1),
      text: z.string().min(1).optional(),
      to: linkTargetSchema.optional(),
    }),
    applicability: z.string().min(1),
    sourceName: z.string().min(1),
    sourceUrl: z.string().url(),
    extraLinks: z
      .array(z.object({ label: z.string().min(1), url: z.string().url() }))
      .default([]),
    sourceNote: z.string().optional(),
    publishedAt: isoDateSchema.optional(),
    verifiedAt: isoDateSchema,
  })
  .superRefine((card, ctx) => {
    if (card.action.kind === "copy" && !card.action.text) {
      ctx.addIssue({ code: "custom", message: `${card.id}: 复制动作缺少文本` });
    }
    if (card.action.kind === "link" && !card.action.to) {
      ctx.addIssue({ code: "custom", message: `${card.id}: 跳转动作缺少目标` });
    }
  });

export const knowledgeCardsSchema = z.array(knowledgeCardSchema).min(1);
export type KnowledgeCard = z.infer<typeof knowledgeCardSchema>;

export const policyRegionSchema = z.enum(["全国", "浙江", "景宁"]);
export type PolicyRegion = z.infer<typeof policyRegionSchema>;

export const policyCategorySchema = z.enum([
  "参保与结算",
  "门诊特殊病种",
  "医疗救助",
  "公益项目",
]);
export type PolicyCategory = z.infer<typeof policyCategorySchema>;

export const policyResourceSchema = z.object({
  id: z.string().min(1),
  region: policyRegionSchema,
  category: policyCategorySchema,
  alsoCovers: z.array(policyCategorySchema).default([]),
  title: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(knowledgeDetailSchema).default([]),
  applicability: z.string().min(1),
  issuer: z.string().min(1),
  sourceUrl: z.string().url(),
  extraLinks: z
    .array(z.object({ label: z.string().min(1), url: z.string().url() }))
    .default([]),
  sourceNote: z.string().optional(),
  publishedAt: isoDateSchema.optional(),
  verifiedAt: isoDateSchema,
  entryText: z.string().min(1),
  confirmQuestions: z.array(z.string().min(1)).default([]),
  isArchived: z.boolean().default(false),
});

export const policyResourcesSchema = z.array(policyResourceSchema).min(1);
export type PolicyResource = z.infer<typeof policyResourceSchema>;

export const materialBasisSchema = z.enum(["公告写明", "请在官方入口确认"]);
export type MaterialBasis = z.infer<typeof materialBasisSchema>;

export const materialStateSchema = z.enum([
  "未准备",
  "已准备",
  "待确认",
  "已向项目方确认无需提供",
]);
export type MaterialState = z.infer<typeof materialStateSchema>;

export const materialStateValues = materialStateSchema.options;

export const aidRuleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().min(1),
  title: z.string().min(1),
  shortName: z.string().min(1),
  region: z.string().min(1),
  scopeText: z.string().min(1),
  resourceId: z.string().min(1),
  eligibleCategories: z.array(z.enum(["住院", "门诊", "外购药", "基因检测"])).min(1),
  expenseFrom: isoDateSchema,
  expenseTo: isoDateSchema,
  deadlineText: z.string().min(1),
  sourceUrl: z.string().url(),
  publishedAt: isoDateSchema,
  verifiedAt: isoDateSchema,
  officialEntryText: z.string().min(1),
  hotline: z.string().min(1).optional(),
  hotlineNote: z.string().min(1).optional(),
  materialItems: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        basis: materialBasisSchema,
        note: z.string().min(1),
      }),
    )
    .min(1),
});

export type AidRule = z.infer<typeof aidRuleSchema>;

export function formatCalendarDate(value: string): string {
  return value;
}
