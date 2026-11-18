import { z } from "zod";

export const hotspotQuizSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(3),
    answer: z.number().int().nonnegative(),
    explain: z.string().min(1),
  })
  .refine((quiz) => quiz.answer < quiz.options.length, { message: "quiz answer 超出选项范围" });

export const hotspotSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  label: z.string().min(1),
  text: z.string().min(1),
  extra: z.string().min(1),
  quiz: hotspotQuizSchema,
});

export const SCENE_IDS = [
  "marrow-factory",
  "vessel-highway",
  "detective-lab",
  "treatment-marathon",
  "shield-camp",
  "recovery-garden",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export const scene3DSchema = z.object({
  id: z.enum(SCENE_IDS),
  title: z.string().min(1),
  teaser: z.string().min(1),
  fallback2d: z.enum(["factory", "cells", "detective", "marathon", "shield", "garden"]),
  fallbackText: z.string().min(1),
  sticker: z.object({
    kind: z.enum(["red", "white", "platelet", "stem", "blast"]),
    title: z.string().min(1),
    text: z.string().min(1),
  }),
  hotspots: z.array(hotspotSchema).min(1),
  camera: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
  }),
  performanceTier: z.enum(["low", "medium", "high"]),
});

export type Scene3D = z.infer<typeof scene3DSchema>;

const rawScenes: Scene3D[] = [
  {
    id: "marrow-factory",
    title: "骨髓工厂",
    teaser: "钻进骨头里，看看血细胞是在哪里出生的",
    fallback2d: "factory",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：细胞宝宝在骨髓工厂里出生、长大、出厂。",
    sticker: { kind: "stem", title: "干细胞宝宝", text: "骨髓工厂里出生的细胞宝宝，长大以后能变成各种小帮手。" },
    hotspots: [
      {
        id: "stem",
        label: "干细胞",
        text: "这是细胞宝宝。所有血细胞都是从它长大、变出来的。",
        extra: "细胞宝宝要在工厂里慢慢长大，学会本领，才算出厂。",
        quiz: {
          question: "所有血细胞，都是从谁变来的？",
          options: ["干细胞", "红细胞", "血小板"],
          answer: 0,
          explain: "干细胞是细胞宝宝，长大以后能变成各种各样的小帮手。",
        },
      },
      {
        id: "red",
        label: "红细胞",
        text: "红细胞工位：长大以后变成送货员，背着氧气出发。",
        extra: "氧气送到了，身体才有精神跑来跑去。",
        quiz: {
          question: "红细胞出厂以后去做什么？",
          options: ["送货", "巡逻", "修补"],
          answer: 0,
          explain: "红细胞背着氧气包，是身体里的送货员。",
        },
      },
      {
        id: "white",
        label: "白细胞",
        text: "白细胞工位：长大以后变成小卫士，去巡逻打病菌。",
        extra: "白细胞学会的本领，是认出病菌，再把它打败。",
        quiz: {
          question: "白细胞长大后做什么工作？",
          options: ["送氧气", "打病菌", "止血"],
          answer: 1,
          explain: "白细胞是小卫士，负责巡逻和打病菌。",
        },
      },
      {
        id: "platelet",
        label: "血小板",
        text: "血小板工位：长大以后变成修补工，随时准备止血。",
        extra: "血小板个头小，但会很快赶到有小伤口的地方。",
        quiz: {
          question: "血小板会赶去哪里帮忙？",
          options: ["骨头里", "有小伤口的地方", "学校里"],
          answer: 1,
          explain: "身上哪里有小伤口，血小板就赶过去贴小补丁。",
        },
      },
      {
        id: "marrow",
        label: "骨髓",
        text: "这些软软的、像海绵一样的地方就是骨髓，藏在大多数骨头的中间。",
        extra: "骨髓就是这座造血小工厂，所有血细胞都在这里出生。",
        quiz: {
          question: "骨髓摸起来像什么？",
          options: ["硬硬的石头", "凉凉的水", "软软的海绵"],
          answer: 2,
          explain: "骨髓软软的、像海绵，藏在大多数骨头的中间。",
        },
      },
    ],
    camera: { position: [0, 2.4, 7.2], target: [0, 0.4, 0] },
    performanceTier: "medium",
  },
  {
    id: "vessel-highway",
    title: "血管公路",
    teaser: "顺着血流跑一趟，看看小帮手们怎么上班",
    fallback2d: "cells",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：小帮手们在血管公路里送货、巡逻、修补。",
    sticker: { kind: "red", title: "红细胞送货员", text: "背着氧气在血管公路上奔跑，把氧气送到身体的每个角落。" },
    hotspots: [
      {
        id: "oxygen",
        label: "氧气配送",
        text: "红细胞背着氧气包，把氧气送到身体的每个角落。",
        extra: "氧气送到了，跑起来、笑起来才有力气。",
        quiz: {
          question: "红细胞背着什么出发？",
          options: ["氧气", "小盾牌", "小补丁"],
          answer: 0,
          explain: "红细胞是送货员，氧气包就是它要送的东西。",
        },
      },
      {
        id: "germ",
        label: "病菌入侵",
        text: "病菌想闯进来时，白细胞小卫士会赶过去把它打败。",
        extra: "白细胞不够用的时候，病菌更容易捣乱，所以要听医生的话保护自己。",
        quiz: {
          question: "病菌闯进来时，谁去巡逻？",
          options: ["红细胞", "血小板", "白细胞"],
          answer: 2,
          explain: "白细胞是小卫士，负责巡逻和打败病菌。",
        },
      },
      {
        id: "patch",
        label: "止血",
        text: "哪里有细小的破损，血小板就赶过去贴上小补丁帮忙止血。",
        extra: "很多血小板挤在一起，小伤口很快就被补好。",
        quiz: {
          question: "负责止血的是哪位小帮手？",
          options: ["血小板", "红细胞", "白细胞"],
          answer: 0,
          explain: "血小板是修补工，会赶去贴上小补丁。",
        },
      },
    ],
    camera: { position: [0, 2.8, 8], target: [0, 0, 0] },
    performanceTier: "medium",
  },
  {
    id: "detective-lab",
    title: "侦探实验室",
    teaser: "医生的检查工具都在这里，看看每一样在查什么",
    fallback2d: "detective",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：医生的侦探工具各查什么。",
    sticker: { kind: "white", title: "白细胞小侦探", text: "陪着医生一起找线索，看看每样检查到底在查什么。" },
    hotspots: [
      {
        id: "blood-test",
        label: "血常规",
        text: "取一点点血，数一数红细胞、白细胞和血小板够不够。治疗时会做很多次，护士已经很熟练了。",
        extra: "报告上的数字交给医生看，小朋友不用自己猜。",
        quiz: {
          question: "血常规是在数什么？",
          options: ["小帮手够不够", "身高多少", "头发多少"],
          answer: 0,
          explain: "血常规数的是红细胞、白细胞和血小板。",
        },
      },
      {
        id: "marrow-check",
        label: "骨髓检查",
        text: "医生从骨髓工厂取一点点「样本」来看。取走的那一点点，身体很快就会补回来。",
        extra: "取样的时候可以用让人睡着或放松的药，很多小朋友睡一觉就做完了。",
        quiz: {
          question: "骨穿取的是哪里的样本？",
          options: ["骨髓工厂的样本", "肚子里的食物", "一根头发"],
          answer: 0,
          explain: "骨穿是从骨髓工厂取一点点样本来看。",
        },
      },
      {
        id: "lumbar",
        label: "腰穿",
        text: "从后腰取一点点包着大脑和脊髓的液体，看看那里有没有捣蛋的细胞。做检查时害怕是正常的，可以握着大人的手。",
        extra: "做完以后怎么躺、怎么休息，按治疗医院的宣教做。",
        quiz: {
          question: "腰穿取的是哪里的液体？",
          options: ["眼泪", "包着大脑和脊髓的液体", "口水"],
          answer: 1,
          explain: "腰穿从后腰取一点点包着大脑和脊髓的液体。",
        },
      },
      {
        id: "immuno",
        label: "免疫分型",
        text: "像查细胞的身份证：看看捣蛋细胞到底是哪一种，医生才能选对办法。",
        extra: "认出了细胞的「身份」，医生才好决定下一步怎么查。",
        quiz: {
          question: "免疫分型像在做什么？",
          options: ["查细胞的身份证", "量体温", "数头发"],
          answer: 0,
          explain: "它像查细胞的身份证，帮医生认清楚捣蛋细胞。",
        },
      },
      {
        id: "gene",
        label: "基因检测",
        text: "看细胞里面的「图纸」，帮医生把问题找得更清楚。同一份样本会出好几张报告，时间不一样。",
        extra: "图纸里的信息，医生会讲给爸爸妈妈听。",
        quiz: {
          question: "基因检测在看细胞的什么？",
          options: ["外面的颜色", "有多重", "里面的图纸"],
          answer: 2,
          explain: "基因检测就像看细胞里面的图纸。",
        },
      },
    ],
    camera: { position: [0, 3, 7.5], target: [0, 0.5, 0] },
    performanceTier: "medium",
  },
  {
    id: "treatment-marathon",
    title: "治疗马拉松",
    teaser: "治疗像一段长跑，看看赛道和陪跑的人",
    fallback2d: "marathon",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：治疗分几段，每一段在做什么。",
    sticker: { kind: "platelet", title: "血小板陪跑员", text: "认识赛道边的每个补给站，陪你一段一段把长跑跑完。" },
    hotspots: [
      {
        id: "induction",
        label: "诱导缓解",
        text: "第一段赛道：把大部分捣蛋细胞赶走。这一段常常要在医院里度过，医生护士会一直在旁边。",
        extra: "每段路有多长，医生会告诉你和家人。",
        quiz: {
          question: "第一段赛道叫什么？",
          options: ["巩固", "诱导", "维持"],
          answer: 1,
          explain: "第一段叫诱导，任务是赶走大部分捣蛋细胞。",
        },
      },
      {
        id: "consolidation",
        label: "巩固",
        text: "第二段赛道：把剩下藏起来的捣蛋细胞继续清理干净。",
        extra: "剩下的细胞会藏起来，所以这段要继续仔细清理。",
        quiz: {
          question: "巩固这一段在做什么？",
          options: ["继续清理剩下的捣蛋细胞", "开始放长假", "换一家医院"],
          answer: 0,
          explain: "巩固是把剩下藏起来的捣蛋细胞继续清理干净。",
        },
      },
      {
        id: "maintenance",
        label: "维持",
        text: "最后一段赛道最长，常常是在家按时吃药、定期回医院检查。每个小朋友的跑道长短不一样，医生会告诉你。",
        extra: "在家也要记好吃药的时间，有不懂的就问大人。",
        quiz: {
          question: "维持这一段，常常在哪里？",
          options: ["一直在医院住着", "在家按时吃药", "不用吃药"],
          answer: 1,
          explain: "维持常常是在家按时吃药、定期回医院检查。",
        },
      },
      {
        id: "checkin",
        label: "复诊",
        text: "赛道边的补给站：回医院让医生看看小帮手们够不够强壮。离治疗结束越久，回来的次数一般会越少。",
        extra: "补给站不是终点，是给身体加加油的地方。",
        quiz: {
          question: "补给站代表什么？",
          options: ["终点线", "起跑线", "复诊"],
          answer: 2,
          explain: "补给站就是回医院复诊，让医生看看小帮手。",
        },
      },
    ],
    camera: { position: [0, 4.2, 9], target: [0, 0, 0] },
    performanceTier: "medium",
  },
  {
    id: "shield-camp",
    title: "盾牌训练营",
    teaser: "小卫士变少的时候，在这里练习保护自己",
    fallback2d: "shield",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：白细胞少的时候怎么保护自己。",
    sticker: { kind: "white", title: "白细胞小卫士", text: "在训练营里学会了洗手、戴口罩，也知道发烧要马上说。" },
    hotspots: [
      {
        id: "fever",
        label: "发烧怎么办",
        text: "觉得发烧、发冷或者很不舒服，马上告诉大人，按医生教的方式联系医院。这是训练营里最重要的一课。",
        extra: "不要自己扛着，也不自己去买药，告诉大人最重要。",
        quiz: {
          question: "训练营里最重要的一课是什么？",
          options: ["发烧了马上告诉大人", "先忍着不说", "自己去药店买药"],
          answer: 0,
          explain: "发烧、发冷或者很不舒服，要马上告诉大人。",
        },
      },
      {
        id: "wash",
        label: "洗手",
        text: "用肥皂和流水洗手，里里外外都洗到。洗手是最便宜也最厉害的小盾牌。",
        extra: "手心、手背、手指缝，一个地方都别落下。",
        quiz: {
          question: "洗手要用什么？",
          options: ["干纸巾擦一擦", "用肥皂和流水洗", "喷一点香水"],
          answer: 1,
          explain: "肥皂加流水，才能把小病菌冲走。",
        },
      },
      {
        id: "mask",
        label: "戴口罩",
        text: "去医院或者人多的地方，按医生说的戴口罩，帮身体挡住病菌。",
        extra: "戴好以后捏一捏鼻梁那里，会罩得更贴合。",
        quiz: {
          question: "口罩帮身体做什么？",
          options: ["挡住病菌", "挡住太阳", "保暖"],
          answer: 0,
          explain: "口罩像一面小盾牌，帮身体挡住病菌。",
        },
      },
      {
        id: "crowd",
        label: "避免人群",
        text: "小卫士少的时候，离人多的地方和生病的人远一点，毛绒玩具和小动物先放一放。",
        extra: "花草也先不摆进房间，等小卫士多起来再说。",
        quiz: {
          question: "白细胞少的时候，下面哪个先放一放？",
          options: ["作业本", "水杯", "毛绒玩具"],
          answer: 2,
          explain: "毛绒玩具、小动物和花草，这时候都先放一放。",
        },
      },
    ],
    camera: { position: [0, 3.2, 8.5], target: [0, 0.6, 0] },
    performanceTier: "medium",
  },
  {
    id: "recovery-garden",
    title: "康复花园",
    teaser: "好好睡觉、好好吃饭，慢慢把力气养回来",
    fallback2d: "garden",
    fallbackText:
      "这是 2D 版探险图，和 3D 里的热点内容完全一样：康复期可以做什么。",
    sticker: { kind: "red", title: "红细胞园丁", text: "在康复花园里浇水、散步，陪你一点点把力气养回来。" },
    hotspots: [
      {
        id: "nutrition",
        label: "营养",
        text: "少量多餐，食物多样，吃熟透的东西。胃口不好的时候，告诉大人，一起想办法。",
        extra: "不用一顿吃很多，一天里分几次吃也可以。",
        quiz: {
          question: "胃口不好的时候怎么办？",
          options: ["偷偷不吃", "告诉大人一起想办法", "自己找偏方"],
          answer: 1,
          explain: "胃口不好就告诉大人，一起换着花样想办法。",
        },
      },
      {
        id: "activity",
        label: "活动",
        text: "按体力散散步、伸伸懒腰，累了就休息。容易碰撞的运动先不玩。",
        extra: "今天能走多远就走多远，不用和别人比。",
        quiz: {
          question: "康复期运动要注意什么？",
          options: ["越剧烈越好", "不用休息", "按体力来，累了就休息"],
          answer: 2,
          explain: "运动要按自己的体力来，累了就停下来休息。",
        },
      },
      {
        id: "school",
        label: "返校",
        text: "身体好一点以后，可以慢慢回到学校。什么时候回、怎么回，医生会和爸爸妈妈一起商量。",
        extra: "可以先从半天或者线上参与开始，慢慢来。",
        quiz: {
          question: "想返校的时候，先和谁商量？",
          options: ["医生和爸爸妈妈", "同学", "自己一个人决定"],
          answer: 0,
          explain: "返校的时间，医生会和爸爸妈妈一起商量。",
        },
      },
      {
        id: "mood",
        label: "心情",
        text: "害怕、生气、难过都是正常的心情，没有哪一种心情是错的。把心里话说给大人听。",
        extra: "说不出口的时候，也可以画下来或者写在纸上。",
        quiz: {
          question: "难过、害怕、生气的时候，可以怎么做？",
          options: ["全部忍住", "假装没有", "说给大人听"],
          answer: 2,
          explain: "每一种心情都是正常的，说给大人听会舒服一些。",
        },
      },
    ],
    camera: { position: [0, 3.4, 8.5], target: [0, 0.4, 0] },
    performanceTier: "medium",
  },
];

export const scenes3D: Scene3D[] = z.array(scene3DSchema).parse(rawScenes);

export function getScene3D(id: string | null | undefined): Scene3D | undefined {
  return scenes3D.find((scene) => scene.id === id);
}
