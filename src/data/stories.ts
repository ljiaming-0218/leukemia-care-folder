import { z } from "zod";

const storyThemeSchema = z.enum(["费用与材料", "异地照护", "治疗节奏"]);

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD");

const timelineItemSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
});

const storySourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  publishedAt: isoDateSchema,
  verifiedAt: isoDateSchema,
  note: z.string().min(1),
});

const storySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ageLabel: z.string().min(1),
  place: z.string().min(1),
  diagnosis: z.string().min(1),
  phase: z.string().min(1),
  quote: z.string().min(1),
  quoteBy: z.string().min(1),
  summary: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(2),
  timeline: z.array(timelineItemSchema).min(2).max(4),
  record: z.object({
    title: z.string().min(1),
    documents: z.array(z.string().min(1)).min(1),
    entry: z.string().min(1),
    note: z.string().min(1),
  }),
  themes: z.array(storyThemeSchema).min(1),
  needs: z.array(z.string().min(1)).min(1),
  supports: z.array(z.string().min(1)).min(1),
  tools: z.array(z.object({ label: z.string().min(1), to: z.string().min(1) })),
  accent: z.enum(["teal", "gold", "rose"]),
  source: storySourceSchema,
});

export type Story = z.infer<typeof storySchema>;
export type StoryTheme = z.infer<typeof storyThemeSchema>;

export const storyThemes: StoryTheme[] = ["费用与材料", "异地照护", "治疗节奏"];

const verifiedAt = "2026-11-16";

export const stories: Story[] = z.array(storySchema).parse([
  {
    id: "yueyue",
    name: "月月",
    ageLabel: "确诊时 1 周岁",
    place: "福建龙岩漳平，在福州治疗",
    diagnosis: "急性淋巴细胞白血病（ALL）",
    phase: "婴儿期治疗（2023 年报道）",
    quote: "还好有小家，不然我们真的不知道要怎么办。",
    quoteBy: "月月妈妈，报道原文",
    summary:
      "一周岁常规体检时查出白血病，从漳平转到福州治疗。2023 年 4 月住进为异地患儿家庭提供免费住宿的「福州小家」。",
    paragraphs: [
      "月月在满一周岁做常规体检时查出急性淋巴细胞白血病，老家医生建议家里到福州的协和医院治疗。异地求医，一家人同时面对治疗费用、住宿和护理问题。",
      "2023 年 4 月 2 日，妈妈一手抱着月月、一手提着一袋换洗衣物走进「福州小家」。报道里，月月属于较严重的「婴儿白」；化疗第一步 PICC 置管就几经堵塞、发炎、回血、重置，治疗过程中还并发了肺炎、发烧咳嗽。",
      "她不舒服却没办法表达，只能整宿哭；妈妈白天煮饭喂饭，晚上整宿照顾，几乎没有休息时间。妈妈说：「还好有小家，不然我们真的不知道要怎么办。」",
    ],
    timeline: [
      {
        label: "一周岁体检",
        title: "确诊与转诊",
        text: "常规体检发现急性淋巴细胞白血病，老家医生建议到福州协和医院治疗。",
      },
      {
        label: "2023-04-02",
        title: "住进「福州小家」",
        text: "妈妈带着月月住进为异地患儿家庭提供免费住宿的公益项目，志愿者营家新接待了她们。",
      },
      {
        label: "治疗期间",
        title: "PICC 与感染",
        text: "置管多次堵塞、发炎、回血、重置，并并发肺炎、发烧咳嗽；妈妈几乎整夜照顾。",
      },
    ],
    record: {
      title: "报道里能核对的一笔现实支出",
      documents: ["异地治疗费用", "免费住宿与生活物资"],
      entry: "异地求医 → 医疗与照护同时发生",
      note: "报道没有写具体金额，这里不补数字。家庭记账时，住宿、交通和护理应与医疗票据分开记录。",
    },
    themes: ["费用与材料", "异地照护", "治疗节奏"],
    needs: ["异地治疗期间的住宿与护理", "感染期间的整夜照护"],
    supports: ["「福州小家」提供免费住宿、厨房和生活物资", "志愿者陪伴与资源链接"],
    tools: [
      { label: "查跨省异地就医", to: "/resources?region=全国&category=参保与结算" },
      { label: "整理票据", to: "/receipts" },
      { label: "看家庭费用", to: "/ledger" },
    ],
    accent: "teal",
    source: {
      name: "东南网（福建日报）",
      url: "https://fjnews.fjsen.com/wap/2023-11/03/content_31447939.htm",
      publishedAt: "2023-11-03",
      verifiedAt,
      note: "记者探访报道；文中儿童姓名按报道原文使用。",
    },
  },
  {
    id: "xiaojie",
    name: "小杰",
    ageLabel: "治疗时 13 岁",
    place: "福建福州（异地治疗）",
    diagnosis: "白血病（报道未写具体分型）",
    phase: "已结疗，2023 年报道时已康复",
    quote: "完全认不出来了。",
    quoteBy: "志愿者施敏，报道原文",
    summary:
      "2017 年 13 岁时独自到福州治疗，没有监护人。小家志愿者当起临时监护人，陪他化疗、走疗。2023 年他已康复，在公益日活动上和志愿者重逢。",
    paragraphs: [
      "小杰是「福州小家」2017 年 5 月接待的白血病患儿，当时 13 岁。报道写他家庭情况特殊、没有监护人，多数情况下一个人来福州治疗，医疗费用、住宿、吃饭，每一步都是槛。",
      "小家志愿者当起他的临时监护人，化疗、走疗，往返医院和小家都陪在身边。",
      "2023 年 9 月 9 日，他受邀参加「福州小家」公益日活动，和在场 100 多位爱心人士分享自己的故事。会后，他一眼认出当年陪伴他的志愿者施敏，两人像老友般拥抱。施敏揽着他的肩说：「完全认不出来了。」",
    ],
    timeline: [
      {
        label: "2017-05",
        title: "一个人来福州",
        text: "13 岁，家庭情况特殊、没有监护人，多数情况下独自到福州治疗。",
      },
      {
        label: "治疗期间",
        title: "志愿者当临时监护人",
        text: "小家志愿者陪他化疗、走疗，往返医院和小家。",
      },
      {
        label: "2023-09-09",
        title: "公益日重逢",
        text: "已经康复，个子高了也壮了；在活动上与当年陪伴他的志愿者施敏重逢。",
      },
    ],
    record: {
      title: "没有监护人时，谁陪着去医院",
      documents: ["临时监护与陪伴", "往返医院和住处的安排"],
      entry: "独自就医 → 志愿者陪伴",
      note: "报道没有列出他的票据或资助明细。需要委托他人陪诊时，监护、授权和签字要求应直接问医院和经办机构。",
    },
    themes: ["费用与材料", "异地照护"],
    needs: ["治疗期间的监护与陪诊", "医疗、住宿和吃饭的支出"],
    supports: ["「福州小家」提供免费住宿和生活物资", "志愿者担任临时监护人，陪同化疗与走疗"],
    tools: [
      { label: "查医疗救助", to: "/resources?category=医疗救助" },
      { label: "小鹿灯材料准备", to: "/prepare" },
      { label: "整理票据", to: "/receipts" },
    ],
    accent: "gold",
    source: {
      name: "东南网（福建日报）",
      url: "https://fjnews.fjsen.com/wap/2023-11/03/content_31447939.htm",
      publishedAt: "2023-11-03",
      verifiedAt,
      note: "记者探访报道；文中儿童姓名按报道原文使用。",
    },
  },
  {
    id: "xuanxuan",
    name: "轩轩",
    ageLabel: "14 岁",
    place: "江西上饶鄱阳",
    diagnosis: "急性淋巴细胞白血病（ALL）",
    phase: "治疗中（2026 年 11 月报道）",
    quote: "我们苦一点没关系，就希望孩子早点好起来。",
    quoteBy: "轩轩妈妈，报道原文",
    summary:
      "2025 年 8 月确诊，治疗期间遭遇病毒感染，花费高昂。2026 年 8 月和 9 月，家里先后获得两笔救助资金。",
    paragraphs: [
      "2025 年 8 月，轩轩被确诊为急性淋巴细胞白血病。治疗期间遭遇病毒感染，花费高昂，家中入不敷出。",
      "他喜欢打篮球，家里墙上还贴着他参加篮球比赛的奖状。2026 年 11 月，中国红十字基金会小天使基金「白血病救助一帮一」项目探访小组到他家，送给他一个篮球，他露出了久违的笑容。",
      "当地红十字会得知情况后联系他的父母，辅导申请资助。2026 年 8 月，轩轩获得中央专项彩票公益金大病儿童救助项目资助 3 万元；9 月，获得小天使基金人道关怀金项目资助 5000 元。",
    ],
    timeline: [
      {
        label: "2025-08",
        title: "确诊",
        text: "急性淋巴细胞白血病；治疗期间遭遇病毒感染，花费高昂。",
      },
      {
        label: "2026-08",
        title: "第一笔资助",
        text: "中央专项彩票公益金大病儿童救助项目资助 3 万元。",
      },
      {
        label: "2026-09",
        title: "第二笔资助",
        text: "中国红十字基金会小天使基金人道关怀金项目资助 5000 元。",
      },
      {
        label: "2026-11",
        title: "项目探访",
        text: "探访小组送来篮球；报道时他仍坐在轮椅上。",
      },
    ],
    record: {
      title: "两笔救助到账怎么记",
      documents: ["中央专项彩票公益金资助 3 万元", "小天使基金人道关怀金 5000 元"],
      entry: "救助到账 → 与医疗费用分列",
      note: "报道写的是受助金额，不是报销比例。记账时把救助到账单独记录，不要从医疗费用里直接抵扣，避免和医保支付混在一起。",
    },
    themes: ["费用与材料", "治疗节奏"],
    needs: ["持续治疗费用", "治疗期间的照护与陪伴"],
    supports: ["中央专项彩票公益金大病儿童救助项目 3 万元", "小天使基金人道关怀金 5000 元", "当地红十字会辅导申请"],
    tools: [
      { label: "查公益救助入口", to: "/resources?region=全国&category=公益项目" },
      { label: "记一笔救助到账", to: "/ledger" },
      { label: "小鹿灯材料准备", to: "/prepare" },
    ],
    accent: "rose",
    source: {
      name: "新华网（中国网转载）",
      url: "http://news.china.com.cn/2026-11/11/content_118770857.shtml",
      publishedAt: "2026-11-11",
      verifiedAt,
      note: "新华社记者探访报道；文中受访患儿均为化名。",
    },
  },
]);
