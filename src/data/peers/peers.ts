import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD");

export const PEER_THEMES = ["刚确诊", "异地就医", "治疗与随访", "返校与手足"] as const;

export const peerStorySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  themes: z.array(z.enum(PEER_THEMES)).min(1),
  sourcePublisher: z.string().min(1),
  sourceTitle: z.string().min(1),
  sourceUrl: z.string().url(),
  publishedAt: isoDateSchema,
  verifiedAt: isoDateSchema,
  deidentifiedNote: z.string().min(1),
  feared: z.array(z.string().min(1)).min(1),
  wanted: z.array(z.string().min(1)).min(1),
  walked: z.array(z.string().min(1)).min(2),
  message: z.string().min(1),
  support: z.array(z.string().min(1)).min(1),
  relatedChapterIds: z.array(z.string().min(1)).min(1),
});

export type PeerStory = z.infer<typeof peerStorySchema>;
export type PeerTheme = (typeof PEER_THEMES)[number];

const verifiedAt = "2026-11-18";

export const peerStories: PeerStory[] = z.array(peerStorySchema).parse([
  {
    id: "infection-basketball",
    title: "治疗里遇上感染，一个篮球让他笑了一下",
    summary:
      "一个喜欢打篮球的男孩，治疗期间遭遇病毒感染，家里一度入不敷出。红十字基金会的探访带来了篮球，也带来了两笔救助。",
    themes: ["治疗与随访"],
    sourcePublisher: "新华社（新浪财经转载）",
    sourceTitle: "用爱心托起生命的希望——“白血病救助一帮一”项目探访活动见闻",
    sourceUrl: "https://finance.sina.cn/2026-11-11/detail-iniykqvx2286670.d.html",
    publishedAt: "2026-11-11",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体村镇和精确日期已做处理。报道中受访患儿本为化名，页面只保留公开报道里的经过。",
    feared: [
      "治疗里又遇上感染，住院时间一拖再拖。",
      "家里为了治病入不敷出，父母不知道还能撑多久。",
      "很久没有碰过篮球，觉得自己离原来的生活越来越远。",
    ],
    wanted: [
      "有人对他爸妈说：你们不是一个人在扛。",
      "有人记得他喜欢篮球，而不只是记得他是个病人。",
    ],
    walked: [
      "当地红十字会联系了他的父母，辅导他们申请救助金。",
      "两笔救助先后到账，家里治疗费用的压力缓了一口气。",
      "探访小组按他平时的爱好带来一个篮球；他接过球，露出了久违的笑容。",
    ],
    message: "最难的时候可以开口问：医院社工、红十字会、公益项目，有没有能申请的支持。",
    support: [
      "中央专项彩票公益金大病儿童救助项目",
      "中国红十字基金会小天使基金人道关怀金项目",
      "当地红十字会辅导家庭申请",
    ],
    relatedChapterIds: ["shield", "marathon"],
  },
  {
    id: "transplant-birthday",
    title: "移植之后，家里还有一个要上学的姐姐",
    summary:
      "一个女孩完成移植后进入恢复期，家里还有姐姐在读书，父母靠打工维持生活。公益项目来探访的那天，正好是她的生日。",
    themes: ["治疗与随访", "返校与手足"],
    sourcePublisher: "新华社（新浪财经转载）",
    sourceTitle: "用爱心托起生命的希望——“白血病救助一帮一”项目探访活动见闻",
    sourceUrl: "https://finance.sina.cn/2026-11-11/detail-iniykqvx2286670.d.html",
    publishedAt: "2026-11-11",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体乡镇和精确日期已做处理。报道中受访患儿本为化名，页面只写公开报道里的经过。",
    feared: [
      "移植后的恢复期很长，复查和日常照顾一样不能落下。",
      "家里的钱要分成两份：一份治病，一份给姐姐上学。",
      "生日在出租屋和医院之间度过，怕没有人记得。",
    ],
    wanted: [
      "有人记得她的生日，把她当成一个普通的孩子。",
      "有人也看见姐姐：她同样需要被照顾。",
    ],
    walked: [
      "完成移植后，按医院安排继续复查和恢复。",
      "公益项目送来装有画具、笔记本和玩具的「英雄能量包」。",
      "探访那天，大家准备了生日蛋糕，她闭上眼睛许了愿。",
    ],
    message: "治疗结束后也要按时复查；家里每个孩子的感受，都值得被看见。",
    support: [
      "造血干细胞移植后的复查与随访",
      "小天使基金「白血病救助一帮一」探访和「英雄能量包」",
    ],
    relatedChapterIds: ["followup", "school"],
  },
  {
    id: "county-to-guangzhou",
    title: "从县医院到广州，一家人重新分工",
    summary:
      "6 岁的男孩反复发烧、喊腿疼，从县医院一路转到广州才确诊。爸爸办异地手续，妈妈陪护，外婆做饭，两个姐姐留在老家。",
    themes: ["刚确诊", "异地就医", "返校与手足"],
    sourcePublisher: "新快报（新浪财经转载）",
    sourceTitle: "白血病治疗进入关键阶段 患儿家庭为治疗费用发愁",
    sourceUrl: "https://finance.sina.cn/tech/2026-07-28/doc-inikhpyq8290628.shtml",
    publishedAt: "2026-07-28",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体区县和精确日期已做处理。报道文内人物为化名，页面只保留治疗和陪护的经过。",
    feared: [
      "孩子反复发烧、喊腿疼，查不出原因的那几天。",
      "突然要去广州，不知道异地手续怎么办、住哪里。",
      "两个姐姐留在老家，没人辅导作业，也没人听她们说想弟弟。",
    ],
    wanted: [
      "有人告诉他们第一步先办什么、第二步再办什么。",
      "有人帮忙照看家里的两个姐姐，让爸妈能安心陪护。",
    ],
    walked: [
      "县医院查血发现异常，当天转到市医院。",
      "骨穿、腰穿后确诊；爸爸回老家收拾行李，同时办理异地就医。",
      "到广州后，妈妈在医院附近租房陪护，外婆从老家来做饭，爷爷奶奶照看两个姐姐。",
      "住院期间出现感染，出院时间一拖再拖，一家人只能按医生说的等。",
    ],
    message: "异地治疗前，把备案、住处和谁陪护列成一张纸，一样一样办。",
    support: ["按参保地要求办理异地就医备案", "家人分工：陪护、做饭、照看其他孩子"],
    relatedChapterIds: ["detective", "shield"],
  },
  {
    id: "single-mother",
    title: "单亲妈妈带着女儿，连夜坐上去广州的高铁",
    summary:
      "一位独自抚养女儿的妈妈，在医生说出「高度怀疑是白血病」后，放下工作连夜带孩子去广州。她在出租屋里消毒、做饭，最揪心的是怎么安抚孩子。",
    themes: ["刚确诊", "异地就医"],
    sourcePublisher: "新快报",
    sourceTitle: "单亲妈妈300多天不离不弃 为白血病女儿筑起生命围墙",
    sourceUrl: "https://www.xkb.com.cn/detail?id=529828",
    publishedAt: "2026-10-12",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体住址和精确日期已做处理。报道中母女均为化名，页面只写治疗和陪护的经过。",
    feared: [
      "医生说出「高度怀疑白血病」的那一刻。",
      "一个人带着孩子在陌生城市，挂号、检查、住院都要自己扛。",
      "女儿问「妈妈，我什么时候才能打败身体里的虫怪」，她不知道怎么回答。",
    ],
    wanted: [
      "有人告诉她：先安顿下来，检查一样一样做。",
      "孩子能少受一点罪，哪怕只吃下一口饭。",
    ],
    walked: [
      "连夜坐高铁到广州，在医院附近租下一间出租屋。",
      "每天消毒房间，坚持自己给孩子做饭，不点外卖。",
      "孩子做检查、化疗，呕吐、掉头发，她一直陪在身边。",
    ],
    message: "一个人陪护的时候，把「找谁帮忙」写下来：医院社工、病友家长、公益项目。",
    support: ["医院附近的出租屋与陪护生活", "公开报道中提到的公益求助渠道"],
    relatedChapterIds: ["detective", "shield"],
  },
  {
    id: "volunteer-guardian",
    title: "少年独自去外地治疗，志愿者成了他的临时家人",
    summary:
      "一个少年独自到福州治疗，家人无法长期陪在身边。公益小家的志愿者陪他化疗、走疗；几年后他上了大学，又回到小家帮忙。",
    themes: ["异地就医", "返校与手足"],
    sourcePublisher: "福州新闻网（转载福建日报）",
    sourceTitle: "在“小家”，爱与希望是治愈的另一味药",
    sourceUrl: "https://m.fznews.com.cn/fzyw/20260227/a061e0lm68.shtml",
    publishedAt: "2026-02-27",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体区县和精确日期已做处理。报道中家庭均为化名；正式的监护、授权和签字要求以医院规定为准。",
    feared: [
      "一个人去医院，签字、检查、住院都不知道找谁。",
      "化疗和走疗之间来回跑，没有家人在身边。",
      "怕自己好不起来，也怕一直麻烦别人。",
    ],
    wanted: [
      "有人陪他去医院，替他记住医生说的话。",
      "有人把他当家人，而不是一个需要同情的病人。",
    ],
    walked: [
      "住进公益小家，吃饭和住宿有了着落。",
      "志愿者像临时监护人一样，陪他化疗、走疗、往返医院。",
      "他在心里许愿要好起来；后来上了大学，回到小家清点物资、组织义卖。",
    ],
    message: "一个人的时候也要开口找医院社工和公益项目；被帮助过的人，也可以成为帮助别人的人。",
    support: ["公益小家提供住宿、自助厨房和生活物资", "志愿者陪诊与日常照护"],
    relatedChapterIds: ["school", "marathon"],
  },
  {
    id: "spring-festival",
    title: "确诊后的第一个春节，一家人在公益小家过年",
    summary:
      "11 岁的女孩在外地确诊，一家人住进公益小家。那年春节他们没有回家，在小家和许多滞留外地的家庭一起吃了团圆饭。",
    themes: ["异地就医", "治疗与随访"],
    sourcePublisher: "福建日报（东南网转载）",
    sourceTitle: "在“小家”，爱与希望是治愈的另一味药",
    sourceUrl: "http://fjwjw.fjsen.com/2026-02/28/content_32139645.htm",
    publishedAt: "2026-02-27",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体县市和精确日期已做处理。页面只保留公开报道里可以核对的部分。",
    feared: [
      "刚确诊，饮食、复查、住院的规矩都还不懂。",
      "春节回不了家，怕孩子更难过。",
      "异地治疗要住多久、花多少，心里没有底。",
    ],
    wanted: [
      "有人告诉他们哪里能免费住、哪里能自己做饭。",
      "孩子能像以前一样热热闹闹地过个年。",
    ],
    walked: [
      "一家人住进公益小家提供的免费房间。",
      "妈妈按医生要求，严格准备每天的饮食。",
      "春节留在小家，和其他滞留外地的家庭、值班医护一起吃团圆饭。",
    ],
    message: "异地治疗时，先问医院社工或病友家长：附近有没有公益住宿和爱心厨房。",
    support: ["公益小家的免费房间、自助厨房和爱心物资", "春节团圆饭与志愿者陪伴"],
    relatedChapterIds: ["shield", "school"],
  },
  {
    id: "ward-school",
    title: "在燕郊「打怪」的第 423 天，她在病房学校画了一条龙",
    summary:
      "一个女孩在外地治疗，爸爸跑单、妈妈陪护，姐妹俩一起去上公益课。爱心车辆免费接送，公益小家提供临时住处，病房学校让她重新拿起画笔。",
    themes: ["治疗与随访", "返校与手足"],
    sourcePublisher: "央视新闻",
    sourceTitle: "新春走基层丨用打怪的心态和病魔抗争！今天是他们“打怪”的第423天……",
    sourceUrl: "https://news.cctv.com/2024/01/27/ARTIyzDGj5yrZkwd6kCQuF3m240127.shtml",
    publishedAt: "2024-01-27",
    verifiedAt,
    deidentifiedNote:
      "报道中的未成年人真实姓名、学校、精确住址和日期已做处理。插画使用通用画法。",
    feared: [
      "治疗要很久，孩子没法回学校，也见不到同学。",
      "爸爸跑单、妈妈陪护，姐妹俩常常被分开照顾。",
      "日子只剩下医院、针管和药，孩子越来越沉默。",
    ],
    wanted: [
      "孩子能继续上课、画画，像普通学生一样。",
      "大人也能有一个喘口气的地方。",
    ],
    walked: [
      "爸爸跑单时听说附近有病房学校，妈妈带姐妹俩去试听。",
      "她每周去上美术课，画龙、做手工，还写「打怪」日记鼓励别的孩子。",
      "提前预约后，爱心车辆免费接送他们去医院；公益小家让新来的家庭先住下。",
    ],
    message: "治疗的日子里也可以继续学习；问问医院或公益机构，有没有病房学校。",
    support: ["新阳光病房学校免费课程", "爱心车辆免费接送", "公益小家短期住宿"],
    relatedChapterIds: ["school", "followup"],
  },
  {
    id: "two-cities",
    title: "爸爸回广西上班，妈妈在广州陪他等移植",
    summary:
      "一个男孩在广州等待骨髓移植，爸爸回广西的电子厂上班，妈妈留在医院陪护。他每天和妹妹视频，平静地告诉她：今年回不去了。",
    themes: ["异地就医", "返校与手足"],
    sourcePublisher: "新快报（新浪财经转载）",
    sourceTitle: "“儿子细胞涨了吗？”",
    sourceUrl: "https://finance.sina.cn/tech/2026-09-14/detail-inirtfmq7549880.d.html",
    publishedAt: "2026-09-14",
    verifiedAt,
    deidentifiedNote:
      "未成年人姓名、具体县市和精确日期已做处理。报道文内人物为化名，页面呈现的是报道里可以核对的治疗和陪护经过。",
    feared: [
      "等移植的日子里，白细胞涨一点、掉一点都让人紧张。",
      "爸爸不在身边，妈妈一个人守在医院。",
      "妹妹在电话里问：哥哥什么时候回家？",
    ],
    wanted: [
      "有人告诉他：爸爸去上班，也是陪你的一种方式。",
      "妹妹能明白，哥哥不是不要她了。",
    ],
    walked: [
      "爸爸回到广西的电子厂上班，用工资撑住一家人异地的生活费。",
      "妈妈留在广州陪护，每天和爸爸通电话，第一句总是问「儿子细胞涨了吗」。",
      "他和妹妹视频，坦白说自己得了白血病、要做移植，今年回不去。",
    ],
    message: "大人分开两地不是不要你；把想念说出来，电话和视频也能陪着你。",
    support: ["家人两地分工：一方陪护、一方工作", "视频通话让兄妹保持联系"],
    relatedChapterIds: ["school", "followup"],
  },
]);

export function getPeerStory(id: string | null | undefined): PeerStory | undefined {
  return peerStories.find((story) => story.id === id);
}
