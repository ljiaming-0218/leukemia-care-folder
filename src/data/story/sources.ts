import { z } from "zod";

export const sourceSchema = z.object({
  id: z.string().min(1),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  reviewedText: z.string().min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
});

export type Source = z.infer<typeof sourceSchema>;

const rawSources = [
  {
    id: "stjude-leukemia",
    publisher: "圣犹达儿童研究医院 Together",
    title: "儿童和青少年白血病",
    url: "https://together.stjude.org/zh-cn/conditions/cancers/leukemia.html",
    reviewedText: "原文审核时间 2022 年 11 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "stjude-what-is-cancer",
    publisher: "圣犹达儿童研究医院 Together",
    title: "关于儿童癌症",
    url: "https://together.stjude.org/zh-cn/conditions/cancers/what-is-cancer.html",
    reviewedText: "原文审核时间 2023 年 6 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "stjude-talking",
    publisher: "圣犹达儿童研究医院 Together",
    title: "如何与孩子谈论癌症",
    url: "https://together.stjude.org/zh-cn/emotional-support-daily-life/parents/talking-to-your-child-about-cancer.html",
    reviewedText: "原文修订时间 2023 年 2 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "stjude-bone-marrow",
    publisher: "圣犹达儿童研究医院 Together",
    title: "骨髓穿刺与活检",
    url: "https://together.stjude.org/zh-cn/treatment-tests-procedures/procedures/bone-marrow-aspiration-biopsy.html",
    reviewedText: "原文审核时间 2024 年 8 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "stjude-hair-loss",
    publisher: "圣犹达儿童研究医院 Together",
    title: "毛发脱落",
    url: "https://together.stjude.org/zh-cn/treatment-tests-procedures/symptoms-side-effects/hair-loss.html",
    reviewedText: "原文审核时间 2023 年 2 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "stjude-fever",
    publisher: "圣犹达儿童研究医院 Together",
    title: "发热与感染征兆",
    url: "https://together.stjude.org/zh-cn/treatment-tests-procedures/symptoms-side-effects/fever-and-signs-of-infection.html",
    reviewedText: "原文审核时间 2025 年 11 月",
    verifiedAt: "2026-11-17",
  },
  {
    id: "sciping-leukemia",
    publisher: "首都儿科研究所血液内科（北京日报客户端「首儿医典」）",
    title: "首儿医典｜儿童白血病",
    url: "https://xinwen.bjd.com.cn/content/s61b41ce4e4b0d5b7f354d27f.html",
    reviewedText: "原文发布 2021-12-11，页面更新 2023-12-28",
    verifiedAt: "2026-11-17",
  },
  {
    id: "nhc-all-apl",
    publisher: "国家卫生健康委员会",
    title: "儿童急性淋巴细胞白血病、儿童急性早幼粒细胞白血病诊疗规范（2018 年版）",
    url: "https://www.nhc.gov.cn/wjw/c100175/201810/bb6112cd824b476b8b6dc7495c3f7b42.shtml",
    reviewedText: "2018 年版",
    verifiedAt: "2026-11-16",
    note: "采用其中的名词解释。",
  },
  {
    id: "all-pathway",
    publisher: "国家卫生健康委（地方医保局刊载）",
    title: "儿童急性淋巴细胞白血病临床路径",
    url: "https://ylbzj.qdn.gov.cn/lclj/xylptb/2019nb/202208/P020220817540095731889.pdf",
    reviewedText: "2019 年版",
    verifiedAt: "2026-11-16",
    note: "路径适用于其写明的人群；这里借用检查和治疗阶段的名称。",
  },
  {
    id: "stjude-nutrition",
    publisher: "圣犹达儿童研究医院 Together",
    title: "儿童癌症临床营养",
    url: "https://together.stjude.org/zh-cn/care-support/clinical-nutrition.html",
    reviewedText: "页面可访问，具体审核时间未标注",
    verifiedAt: "2026-11-18",
  },
  {
    id: "stjude-nutrition-side-effects",
    publisher: "圣犹达儿童研究医院 Together",
    title: "营养和副作用",
    url: "https://together.stjude.org/zh-cn/care-support/clinical-nutrition/nutrition-and-side-effects.html",
    reviewedText: "页面可访问，具体审核时间未标注",
    verifiedAt: "2026-11-18",
  },
  {
    id: "stjude-activity",
    publisher: "圣犹达儿童研究医院 Together",
    title: "儿童癌症患者的体重增加和肥胖",
    url: "https://together.stjude.org/zh-cn/diagnosis-treatment/side-effects/weight-gain-and-obesity.html",
    reviewedText: "页面可访问，具体审核时间未标注",
    verifiedAt: "2026-11-18",
    note: "采用其中关于日常活动和先咨询医疗团队的部分。",
  },
  {
    id: "picc-home-care",
    publisher: "陕西省结核病防治院（陕西省第五人民医院）",
    title: "常见输液工具的居家护理",
    url: "http://www.shaanxijh.com/info/1147/7004.htm",
    reviewedText: "医院官网科普，2025-11-27 发布",
    verifiedAt: "2026-11-18",
    note: "采用其中关于观察和求助的部分；冲管、换药按医院护士的指导。",
  },
  {
    id: "oral-care",
    publisher: "哈医大肿瘤医院（新浪健康刊载）",
    title: "全国爱牙日｜肿瘤患者口腔保健指南请收好",
    url: "https://k.sina.cn/article_1675961211_63e5237b02002jyi0.html?from=health",
    reviewedText: "2026-09-22 发布",
    verifiedAt: "2026-11-18",
    note: "原文面向肿瘤患者，儿童适用部分以治疗团队意见为准。",
  },
  {
    id: "school-vaccines",
    publisher: "向日葵儿童（搜狐刊载）",
    title: "维持治疗期间儿童白血病患者如何安全上学与接种疫苗？",
    url: "https://m.sohu.com/a/885828609_122001004/",
    reviewedText: "中山大学孙逸仙纪念医院周敦华教授问答，2025-04-17 发布",
    verifiedAt: "2026-11-18",
  },
  {
    id: "steroid-leg-pain",
    publisher: "向日葵儿童",
    title: "为什么说化疗是治疗儿童白血病的主要手段？",
    url: "https://www.curekids.cn/relarticle/40c033e598da42cdb8cfc22d08b059f0",
    reviewedText: "页面可访问，具体发布时间未标注",
    verifiedAt: "2026-11-18",
    note: "采用激素期间腿痛、不愿走路时向医生反馈的部分；药物剂量按治疗团队。",
  },
] as const;

export const sources: Source[] = z.array(sourceSchema).parse(rawSources);

export type SourceId = (typeof rawSources)[number]["id"];

const byId = new Map(sources.map((source) => [source.id, source]));

export function getSource(id: SourceId): Source {
  const source = byId.get(id);
  if (!source) throw new Error(`Unknown source ${id}`);
  return source;
}
