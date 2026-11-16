import { z } from "zod";

const storyThemeSchema = z.enum(["费用与材料", "异地照护", "治疗节奏", "复学与陪伴"]);

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
  accent: z.enum(["teal", "gold", "rose", "violet"]),
  source: storySourceSchema,
});

export type Story = z.infer<typeof storySchema>;
export type StoryTheme = z.infer<typeof storyThemeSchema>;

export const storyThemes: StoryTheme[] = ["费用与材料", "异地照护", "治疗节奏", "复学与陪伴"];

const verifiedAt = "2026-11-16";

export const stories: Story[] = z.array(storySchema).parse([
  {
    id: "yueyue",
    name: "小月",
    ageLabel: "确诊时 1 岁多",
    place: "福建某地，在福州治疗",
    diagnosis: "急性淋巴细胞白血病（ALL）",
    phase: "幼儿期治疗（2023 年报道）",
    quote: "还好有小家，不然我们真的不知道要怎么办。",
    quoteBy: "患儿妈妈，报道原文",
    summary:
      "一岁多常规体检时查出白血病，从老家转到福州治疗。2023 年住进为异地患儿家庭提供免费住宿的「福州小家」。",
    paragraphs: [
      "孩子在一岁多做常规体检时查出急性淋巴细胞白血病，老家医生建议家里到福州治疗。异地求医，一家人同时面对治疗费用、住宿和护理问题。",
      "2023 年，妈妈一手抱着孩子、一手提着一袋换洗衣物走进「福州小家」。报道里，孩子属于较严重的「婴儿白」；化疗第一步 PICC 置管就几经堵塞、发炎、回血、重置，治疗过程中还并发了肺炎、发烧咳嗽。",
      "孩子不舒服却没办法表达，只能整宿哭；妈妈白天煮饭喂饭，晚上整宿照顾，几乎没有休息时间。妈妈说：「还好有小家，不然我们真的不知道要怎么办。」",
    ],
    timeline: [
      {
        label: "一岁多体检",
        title: "确诊与转诊",
        text: "常规体检发现急性淋巴细胞白血病，老家医生建议到福州治疗。",
      },
      {
        label: "2023 年",
        title: "住进「福州小家」",
        text: "妈妈带着孩子住进为异地患儿家庭提供免费住宿的公益项目，志愿者接待了她们。",
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
      note: "记者探访报道；本页已对未成年人姓名和具体地点做去标识化处理，来源链接保留。",
    },
  },
  {
    id: "xiaojie",
    name: "阿杰",
    ageLabel: "治疗时 13 岁",
    place: "福建某地（异地治疗）",
    diagnosis: "白血病（报道未写具体分型）",
    phase: "已结疗，报道时已康复",
    quote: "完全认不出来了。",
    quoteBy: "志愿者，报道原文",
    summary:
      "2017 年 13 岁时独自到外地治疗，没有监护人。公益项目志愿者当起临时监护人，陪他化疗、走疗。报道时他已康复，在公益日活动上和志愿者重逢。",
    paragraphs: [
      "他是「福州小家」2017 年接待的白血病患儿，当时 13 岁。报道写他家庭情况特殊、没有监护人，多数情况下一个人来外地治疗，医疗费用、住宿、吃饭，每一步都是槛。",
      "公益项目志愿者当起他的临时监护人，化疗、走疗，往返医院和小家都陪在身边。",
      "2023 年，他受邀参加「福州小家」公益日活动，和在场 100 多位爱心人士分享自己的故事。会后，他一眼认出当年陪伴他的志愿者，两人像老友般拥抱。志愿者揽着他的肩说：「完全认不出来了。」",
    ],
    timeline: [
      {
        label: "2017 年",
        title: "一个人来外地",
        text: "13 岁，家庭情况特殊、没有监护人，多数情况下独自到外地治疗。",
      },
      {
        label: "治疗期间",
        title: "志愿者当临时监护人",
        text: "公益项目志愿者陪他化疗、走疗，往返医院和小家。",
      },
      {
        label: "2023 年",
        title: "公益日重逢",
        text: "已经康复，个子高了也壮了；在活动上与当年陪伴他的志愿者重逢。",
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
      { label: "查医疗救助", to: "/resources?region=全国&category=医疗救助" },
      { label: "小鹿灯材料准备", to: "/prepare?rule=jingning-xiaoludeng-phase5-2026" },
      { label: "整理票据", to: "/receipts" },
    ],
    accent: "gold",
    source: {
      name: "东南网（福建日报）",
      url: "https://fjnews.fjsen.com/wap/2023-11/03/content_31447939.htm",
      publishedAt: "2023-11-03",
      verifiedAt,
      note: "记者探访报道；本页已对未成年人姓名和具体地点做去标识化处理，来源链接保留。",
    },
  },
  {
    id: "xuanxuan",
    name: "小轩",
    ageLabel: "14 岁",
    place: "江西某地",
    diagnosis: "急性淋巴细胞白血病（ALL）",
    phase: "治疗中（2026 年报道）",
    quote: "我们苦一点没关系，就希望孩子早点好起来。",
    quoteBy: "患儿妈妈，报道原文",
    summary:
      "2025 年确诊，治疗期间遭遇病毒感染，花费高昂。2026 年，家里先后获得两笔救助资金。",
    paragraphs: [
      "2025 年，孩子被确诊为急性淋巴细胞白血病。治疗期间遭遇病毒感染，花费高昂，家中入不敷出。",
      "他喜欢打篮球，家里墙上还贴着他参加篮球比赛的奖状。2026 年，中国红十字基金会小天使基金「白血病救助一帮一」项目探访小组到他家，送给他一个篮球，他露出了久违的笑容。",
      "当地红十字会得知情况后联系他的父母，辅导申请资助。2026 年，孩子获得中央专项彩票公益金大病儿童救助项目资助 3 万元；同年，获得小天使基金人道关怀金项目资助 5000 元。",
    ],
    timeline: [
      {
        label: "2025 年",
        title: "确诊",
        text: "急性淋巴细胞白血病；治疗期间遭遇病毒感染，花费高昂。",
      },
      {
        label: "2026 年",
        title: "第一笔资助",
        text: "中央专项彩票公益金大病儿童救助项目资助 3 万元。",
      },
      {
        label: "同年",
        title: "第二笔资助",
        text: "中国红十字基金会小天使基金人道关怀金项目资助 5000 元。",
      },
      {
        label: "2026 年",
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
      { label: "小鹿灯材料准备", to: "/prepare?rule=jingning-xiaoludeng-phase5-2026" },
    ],
    accent: "rose",
    source: {
      name: "新华网（中国网转载）",
      url: "https://news.china.com.cn/2026-11/11/content_118770857.shtml",
      publishedAt: "2026-11-11",
      verifiedAt,
      note: "新华社记者探访报道；报道说明受访患儿为化名，本页进一步隐去具体区县和精确日期。",
    },
  },
  {
    id: "zhigao",
    name: "小志",
    ageLabel: "确诊时 6 岁",
    place: "广东某地，转诊广州治疗",
    diagnosis: "急性淋巴细胞白血病（ALL）",
    phase: "治疗中（2026 年报道）",
    quote: "咱们把车子和房子都卖了吧。",
    quoteBy: "患儿爸爸，报道原文",
    summary:
      "2026 年 5 月确诊，从广东老家转到广州治疗。医生估计治疗至少两年、费用 30 万至 50 万元；住院期间出现感染，一种自费药一个疗程要十多万元。",
    paragraphs: [
      "2026 年 5 月，孩子因反复发烧、腿疼先到县医院查血，医生提示血象异常，当天转到市医院；骨穿和腰穿后确诊急性淋巴细胞白血病。爸爸赶回老家整理行李，同时办理异地就医手续。",
      "转到广州后，医生评估他的年龄和初诊指标有希望归入低危组，但治疗周期至少两年，费用保守估计 30 万到 50 万元；如果发生感染，费用还会更高。夫妻俩商量抵押刚还清贷款的二手房。",
      "住院后孩子出现感染、反复发烧，第二疗程结束仍不能出院。医生提出月底要用一种近万元一支的自费药，一个疗程至少十多支，合计十多万元。爸爸每周五下班后从东莞到广州陪两天，周日再回去上班；妈妈在医院附近租了带隔层的单间，外婆从老家来做饭送饭。",
    ],
    timeline: [
      {
        label: "2026 年 5 月",
        title: "县医院查血",
        text: "反复发烧、腿疼，血常规提示血象异常，当天转往市医院。",
      },
      {
        label: "5 月下旬",
        title: "骨穿确诊",
        text: "确诊急性淋巴细胞白血病；爸爸回老家整理行李，同时办理异地就医手续。",
      },
      {
        label: "转诊广州",
        title: "费用评估",
        text: "医生认为有希望归入低危组，治疗至少两年，费用估计 30 万至 50 万元。",
      },
      {
        label: "7 月起",
        title: "感染与自费药",
        text: "出现感染、反复发烧；医生提出近万元一支的自费药，一疗程至少十多支。",
      },
    ],
    record: {
      title: "一次住院至少有三种凭证",
      documents: ["住院收费票据", "费用明细清单", "医保结算单"],
      entry: "一次住院 → 一个就诊批次",
      note: "报道写的是费用估计和单支药价，不是最终结算金额。实际记账时以票据和结算单为准，自费药单独确认是否在医保目录外。",
    },
    themes: ["费用与材料", "异地照护", "治疗节奏"],
    needs: ["至少两年的治疗费用", "感染期间的自费药", "在广州的住处和陪护"],
    supports: ["医院对低危组的评估", "家人分工：妈妈陪护、外婆做饭、爷爷奶奶照看两个姐姐"],
    tools: [
      { label: "查跨省异地就医", to: "/resources?region=全国&category=参保与结算" },
      { label: "整理票据", to: "/receipts" },
      { label: "看家庭费用", to: "/ledger" },
    ],
    accent: "violet",
    source: {
      name: "新快报（新浪财经转载）",
      url: "https://finance.sina.com.cn/tech/roll/2026-07-28/doc-inikhpyq8290628.shtml",
      publishedAt: "2026-07-28",
      verifiedAt,
      note: "新快报「温暖诉求」报道；文内人物为化名，本页隐去具体区县、精确日期和报道附带的捐款账户。",
    },
  },
  {
    id: "tingting",
    name: "小婷",
    ageLabel: "12 岁",
    place: "江西某地",
    diagnosis: "急性髓细胞性白血病（AML）",
    phase: "移植后恢复期（2026 年报道）",
    quote: "谢谢叔叔阿姨。",
    quoteBy: "患儿，报道原文",
    summary:
      "2022 年 1 月确诊急性髓细胞性白血病，同年 6 月接受造血干细胞移植。家里姐姐在上学，父母靠打工维持生计，每年都有一笔治疗费用。",
    paragraphs: [
      "2022 年 1 月，她被确诊为急性髓细胞性白血病，同年 6 月接受造血干细胞移植。报道时她 12 岁，处在移植后的恢复阶段。",
      "她家里还有一个姐姐在上学，父母靠打工维持生计，爷爷奶奶身体不好，每年都有一笔不小的治疗费用。",
      "2026 年，中国红十字基金会小天使基金「白血病救助一帮一」项目探访小组到她家，送上装有画具、笔记本、玩具等物品的「英雄能量包」。当天恰逢她的生日，探访小组准备了蛋糕，她闭上眼睛许了愿。",
    ],
    timeline: [
      {
        label: "2022 年 1 月",
        title: "确诊",
        text: "急性髓细胞性白血病。",
      },
      {
        label: "同年 6 月",
        title: "造血干细胞移植",
        text: "完成移植，此后进入恢复和随访阶段。",
      },
      {
        label: "2026 年",
        title: "项目探访",
        text: "收到「英雄能量包」，当天在探访中过了生日。",
      },
    ],
    record: {
      title: "移植后的复查按年度归档",
      documents: ["移植与住院费用", "每年复查费用"],
      entry: "一次移植 → 长期随访",
      note: "报道没有写具体金额，这里不补数字。移植后的复查、抗排异和抗感染费用按实际票据分年度归档，避免和移植当年的住院费用混成一笔。",
    },
    themes: ["治疗节奏", "费用与材料"],
    needs: ["移植后的长期复查", "每年持续的治疗费用", "姐姐的学费和家里老人的照护"],
    supports: ["造血干细胞移植", "小天使基金「白血病救助一帮一」探访和「英雄能量包」"],
    tools: [
      { label: "查公益救助入口", to: "/resources?region=全国&category=公益项目" },
      { label: "整理票据", to: "/receipts" },
      { label: "小鹿灯材料准备", to: "/prepare?rule=jingning-xiaoludeng-phase5-2026" },
    ],
    accent: "teal",
    source: {
      name: "新华网",
      url: "https://www.news.cn/politics/20261111/6d0386454242438e8a56d8a68a66aab4/c.html",
      publishedAt: "2026-11-11",
      verifiedAt,
      note: "新华社记者探访报道；文中受访患儿为化名，本页隐去具体乡镇和精确日期。",
    },
  },
  {
    id: "xiaohan",
    name: "小含",
    ageLabel: "8 岁",
    place: "江西，在上海治疗",
    diagnosis: "急性白血病（报道未写具体分型）",
    phase: "移植后恢复（2021 年报道）",
    quote: "正当家里入不敷出、一筹莫展的时候……解了燃眉之急。",
    quoteBy: "患儿爸爸，报道原文（节引）",
    summary:
      "确诊后父母双双请假照顾，家里入不敷出。医院帮助申请青少年救助基金，妈妈作为供者完成单倍体移植，报道时孩子情况良好。",
    paragraphs: [
      "他 8 岁时确诊急性白血病。孩子重病让本不富裕的家庭背上沉重负担，为了照顾孩子，父母只能双双请假。",
      "家里入不敷出时，上海市第一人民医院帮助申请了青少年血液病救助基金，解了燃眉之急。",
      "经过妈妈的单倍体移植，报道时孩子情况良好。医院方面介绍，这类救助款 3 万至 5 万元不等，用于降低家庭承担的费用。",
    ],
    timeline: [
      {
        label: "确诊",
        title: "急性白血病",
        text: "家庭经济压力骤增，父母双双请假照顾。",
      },
      {
        label: "治疗期间",
        title: "收入中断",
        text: "为了照顾孩子，父母只能同时请假。",
      },
      {
        label: "申请救助",
        title: "青少年救助基金",
        text: "医院帮助申请，救助款 3 万至 5 万元不等。",
      },
      {
        label: "移植",
        title: "母亲单倍体移植",
        text: "报道时孩子情况良好。",
      },
    ],
    record: {
      title: "救助到账和医疗票据分开记",
      documents: ["医疗费用票据", "救助款到账记录"],
      entry: "先发生费用 → 后到账救助",
      note: "报道写的是救助款区间，不是报销比例。记账时救助到账单独列，不要从医疗费用里直接抵扣，避免和医保支付混在一起。",
    },
    themes: ["费用与材料", "异地照护"],
    needs: ["治疗费用", "父母同时陪护导致的收入中断"],
    supports: ["医院青少年血液病救助基金 3 万至 5 万元", "母亲作为供者的单倍体移植"],
    tools: [
      { label: "查医疗救助", to: "/resources?region=全国&category=医疗救助" },
      { label: "小鹿灯材料准备", to: "/prepare?rule=jingning-xiaoludeng-phase5-2026" },
      { label: "整理票据", to: "/receipts" },
    ],
    accent: "gold",
    source: {
      name: "中国新闻网（新浪新闻转载）",
      url: "https://news.sina.cn/2021-11-24/detail-iktzscyy7537293.d.html",
      publishedAt: "2021-11-24",
      verifiedAt,
      note: "中新网上海记者报道；报道使用化名，本页隐去具体区县和精确日期。",
    },
  },
  {
    id: "lingzhi",
    name: "灵芝",
    ageLabel: "确诊时不满 10 岁",
    place: "陕西某地，转往河北燕郊治疗",
    diagnosis: "急性髓系白血病（AML）",
    phase: "移植后恢复期（2021 年报道）",
    quote: "尽快回到校园，对患儿们来说似乎已成为一种奢望。",
    quoteBy: "报道原文",
    summary:
      "2019 年确诊，化疗 5 个月未见明显好转后转到河北燕郊做骨髓移植。移植后住在「小白村」，一边走疗一边在公益课堂补课。",
    paragraphs: [
      "2019 年 2 月，不满 10 岁的她被确诊为急性髓系白血病。经过 5 个月化疗，病情未见明显好转，父母带她从陕西来到河北燕郊的医院，希望通过骨髓移植争取机会。",
      "移植后，家庭还要在出租屋和医院之间往返「走疗」，平均周期约三年。为了让她恢复得更好，家里在环境较好的小区租房，月租约 2000 元；爸爸经病友介绍，和其他病友一起送外卖赚生活费。",
      "长期治疗让她一度无学可上。当地公益课堂「爱心苗圃」和「新阳光病房学校」为患儿提供免费课程，她上午上语文，下午学画画。报道时她 12 岁，如果没生病，应该在老家上六年级。",
    ],
    timeline: [
      {
        label: "2019 年 2 月",
        title: "确诊",
        text: "急性髓系白血病。",
      },
      {
        label: "化疗 5 个月",
        title: "效果不明显",
        text: "转到河北燕郊的医院，准备骨髓移植。",
      },
      {
        label: "移植后",
        title: "走疗与租房",
        text: "往返出租屋和医院，平均周期约三年；房租每月约 2000 元。",
      },
      {
        label: "2021 年",
        title: "公益课堂",
        text: "在「爱心苗圃」上语文，在「新阳光病房学校」学画画。",
      },
    ],
    record: {
      title: "异地走疗期间的三类支出",
      documents: ["医疗票据", "房租与交通", "生活与护理支出"],
      entry: "医疗费用 → 生活成本分开",
      note: "报道给出的月租约 2000 元属于生活支出，不应计入医疗费用统计。走疗期的房租、交通和护理开销可以单独记账，便于看清真实负担。",
    },
    themes: ["复学与陪伴", "异地照护", "治疗节奏"],
    needs: ["移植后的长期走疗", "异地房租和生活费", "治疗期间的学习与社交"],
    supports: ["骨髓移植", "「爱心苗圃」「新阳光病房学校」免费课堂", "病友之间的互助和送外卖的工作机会"],
    tools: [
      { label: "查跨省异地就医", to: "/resources?region=全国&category=参保与结算" },
      { label: "看家庭费用", to: "/ledger" },
      { label: "整理票据", to: "/receipts" },
    ],
    accent: "rose",
    source: {
      name: "新京报（腾讯新闻转载）",
      url: "https://news.qq.com/rain/a/20210601A023CH00",
      publishedAt: "2021-06-01",
      verifiedAt,
      note: "新京报摄影报道；灵芝、莹莹均为化名，本页隐去具体住址和精确日期。",
    },
  },
]);
