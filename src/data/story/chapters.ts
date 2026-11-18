import { z } from "zod";
import { FEELING_TOOL_IDS } from "@/src/data/feelings/feelings";
import { recoveryTips } from "@/src/data/recovery/recovery";
import { sources, type SourceId } from "@/src/data/story/sources";

const sourceIds = sources.map((source) => source.id) as [string, ...string[]];
const feelingIds = [...FEELING_TOOL_IDS] as [string, ...string[]];
const recoveryIds = recoveryTips.map((tip) => tip.id) as [string, ...string[]];

const parentScriptSchema = z.object({
  ageBand: z.enum(["6-8", "9-12"]),
  say: z.array(z.string().min(1)).min(2),
  avoid: z.array(z.string().min(1)).min(1),
});

export const chapterSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  number: z.number().int().positive(),
  title: z.string().min(1),
  teaser: z.string().min(1),
  scene: z.enum(["cells", "factory", "mischief", "detective", "marathon", "shield", "school", "followup"]),
  hue: z.enum(["coral", "sun", "plum", "sky", "leaf", "mint", "rose", "lilac"]),
  kidText: z.array(z.string().min(1)).min(1),
  remember: z.string().min(1),
  grownUp: z.object({
    points: z.array(z.string().min(1)).min(1),
    boundary: z.string().min(1),
    scripts: z.array(parentScriptSchema).length(2),
  }),
  sourceIds: z.array(z.enum(sourceIds)).min(1),
  feelingToolIds: z.array(z.enum(feelingIds)),
  recoveryTipIds: z.array(z.enum(recoveryIds)),
  scene3dId: z.enum(["marrow-factory", "vessel-highway", "detective-lab", "treatment-marathon", "shield-camp", "recovery-garden"]).optional(),
  contentWarning: z.string().min(1).optional(),
});

export type Chapter = Omit<z.infer<typeof chapterSchema>, "sourceIds"> & {
  sourceIds: SourceId[];
};

const rawChapters: Chapter[] = [
  {
    id: "helpers",
    number: 1,
    title: "血液里的小帮手",
    teaser: "认识红细胞、白细胞和血小板",
    scene: "cells",
    hue: "coral",
    scene3dId: "vessel-highway",
    kidText: [
      "你的血液里住着三种小帮手，它们每天跟着血液在全身跑来跑去。",
      "红细胞是送货员，把氧气送到身体的每个角落。白细胞是小卫士，帮身体打败病菌。血小板是修补工，身上有小伤口时，它们赶过去帮忙止血。",
      "点一点下面的小帮手，听听它们自我介绍。",
    ],
    remember: "红细胞送氧气，白细胞打病菌，血小板帮止血。",
    grownUp: {
      points: [
        "这一章只讲三类血细胞各自的工作，对应原文：红细胞运送氧气，白细胞对抗感染，血小板帮助血液凝固。",
        "化疗期间医院会经常查血常规，看的就是这几类细胞的数量。孩子以后听到「白细胞低」「血小板低」，可以回到这一章找对应的小帮手。",
      ],
      boundary: "血常规里的数值是否正常、要不要处理，请问主治医生。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "你的血里有三种小帮手：送氧气的、打病菌的、帮止血的。",
            "抽血是看看小帮手够不够，不是惩罚你。",
          ],
          avoid: ["不说「你血不好，所以总生病」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "红细胞送氧气，白细胞抗感染，血小板帮凝血。",
            "治疗时常查血常规，就是看这三类细胞的数量。",
            "数字高低代表什么，我们一起问医生。",
          ],
          avoid: ["不自己解释化验单上的箭头和数值。"],
        },
      ],
    },
    sourceIds: ["stjude-leukemia", "all-pathway"],
    feelingToolIds: ["weather", "courage-sticker"],
    recoveryTipIds: ["fatigue", "nutrition"],
  },
  {
    id: "factory",
    number: 2,
    title: "骨髓小工厂",
    teaser: "小帮手是从哪里来的",
    scene: "factory",
    hue: "sun",
    scene3dId: "marrow-factory",
    kidText: [
      "小帮手是从哪里来的呢？答案藏在骨头里面。",
      "大多数骨头的中间，有一种软软的、像海绵一样的东西，叫骨髓。骨髓就像一座造血工厂，所有的血细胞都是在这里出生的。",
      "刚出生的细胞还是小宝宝，要在工厂里慢慢长大，学会自己的本领，然后才出厂，变成红细胞、白细胞和血小板。",
    ],
    remember: "骨髓是骨头里的小工厂，血细胞在这里长大再出厂。",
    grownUp: {
      points: [
        "「造血工厂」是原文使用的比喻。首都儿科研究所还有一个比喻：骨髓像大树的根，血液里的细胞像树叶，叶子出了问题，要从「根」上找原因。这也是医生要做骨髓检查的原因。",
        "动画里「细胞长大再出厂」对应原文：血细胞在骨髓中由干细胞分化成熟为红细胞、白细胞和血小板。",
      ],
      boundary: "动画帮助理解细胞的工作。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "血细胞住在骨头里一个软软的地方，叫骨髓。",
            "它们像小宝宝一样，在骨髓里长大，再出来工作。",
          ],
          avoid: ["不说「你的骨头坏掉了」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "骨髓里的干细胞会慢慢长成红细胞、白细胞和血小板。",
            "医生看骨髓，是想知道工厂里哪一步出了问题。",
            "检查怎么做、结果怎么看，由医生结合整体情况判断。",
          ],
          avoid: ["不把骨髓检查说成「抽骨头」来吓孩子。"],
        },
      ],
    },
    sourceIds: ["stjude-leukemia", "stjude-bone-marrow", "sciping-leukemia"],
    feelingToolIds: ["weather"],
    recoveryTipIds: ["nutrition"],
  },
  {
    id: "mischief",
    number: 3,
    title: "工厂里出了点错",
    teaser: "白血病是怎么回事，为什么不是你的错",
    scene: "mischief",
    hue: "plum",
    scene3dId: "marrow-factory",
    kidText: [
      "有时候，工厂里的细胞在分裂、长大的时候出了一个小错误。出错的细胞长不大，还一直变多。它们叫白血病细胞。",
      "没长大的细胞太多，把工厂挤得满满的，健康的小帮手就没地方长大了。红细胞少了，人会觉得很累；血小板少了，身上容易青一块、容易流血；白细胞不够用，就容易发烧生病。有的小朋友还会骨头疼。",
      "这个错误是偶然发生的。不是因为你做了什么、说了什么、想了什么，也不是惩罚。白血病也不会传染，你不会传给朋友，朋友也不会传给你。",
    ],
    remember: "生病不是你的错，也不会传染给别人。",
    grownUp: {
      points: [
        "原文说法：白血病患者体内的干细胞无法正常成熟，血液中产生过多的未成熟血细胞；癌细胞挤占健康细胞的空间。",
        "原文还说：与某些成人癌症不同，生活方式和环境因素不会导致儿童癌症；突变通常是细胞分裂时发生的错误。",
        "圣犹达的家长指南提醒：孩子遇到困难时往往会责怪自己，需要明确告诉他们这不是他们的错，癌症也不会传染。可以用「有些孩子会以为……」开头，问孩子是不是也这样想。",
      ],
      boundary: "乏力、易出血、发热、骨痛是细胞变少时可能出现的表现，具体原因和轻重由医生检查判断。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "细胞长大时出了个小差错，不是你做错了什么。",
            "这个病不会传染，你可以和朋友一起玩。",
            "你难过的时候，可以告诉爸爸妈妈。",
          ],
          avoid: ["不说「都是因为你……」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "白血病是造血细胞在发育中出了错，和你的行为没有关系。",
            "它不会通过上课、吃饭或玩耍传染给别人。",
            "有些孩子会偷偷怪自己，你可以直接问我们。",
          ],
          avoid: ["不说「你要坚强，别想太多」堵住孩子的提问。"],
        },
      ],
    },
    sourceIds: ["stjude-leukemia", "stjude-what-is-cancer", "stjude-talking"],
    feelingToolIds: ["not-your-fault", "weather"],
    recoveryTipIds: ["school"],
  },
  {
    id: "detective",
    number: 4,
    title: "医生的侦探工具",
    teaser: "抽血、骨穿、腰穿都是在查什么",
    scene: "detective",
    hue: "sky",
    scene3dId: "detective-lab",
    contentWarning: "这一章会讲到骨穿和腰穿这些检查，可能会有点害怕。可以叫大人陪你一起读。",
    kidText: [
      "医生像侦探一样，要找到工厂里到底出了什么错。他们有几样侦探工具。",
      "抽血：取一点点血，数一数小帮手够不够。这个检查叫血常规，治疗时会做很多次。",
      "骨髓穿刺（骨穿）：从工厂里取一点点骨髓来看，通常从屁股上方的髋骨取。医生可能会用让人睡着或放松的药，消毒的药水凉凉的。取走的那一点点，身体很快就会补回来。",
      "腰椎穿刺（腰穿）：从后腰取一点点包着大脑和脊髓的液体，看看那里有没有捣蛋的细胞。有时医生也会顺便把药送进去。",
    ],
    remember: "检查是为了找到问题、选对办法，害怕的时候可以告诉大人。",
    grownUp: {
      points: [
        "骨髓穿刺与活检原文：孩子可能接受全身麻醉或镇静；样本通常取自髋骨；两项操作合计约 30 分钟；大多数患者 24 小时后可恢复日常活动。",
        "同一份骨髓标本会送去做形态、免疫分型、染色体和基因等检查，所以会有多张报告，出结果的时间也不同。",
        "腰穿取脑脊液，用来判断中枢神经系统是否受累；同一操作中也可能做鞘内注射。术后体位和观察按治疗医院的宣教执行。",
      ],
      boundary: "每家医院的麻醉方式和流程可能不同，以医院宣教为准。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "医生要取一点点血或骨髓，像侦探找线索。",
            "检查可能会有点害怕，你可以叫我们陪着你。",
            "做完检查，身体会慢慢补回来。",
          ],
          avoid: ["不骗孩子「一点都不疼」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "血常规、骨穿、腰穿查的是不同的问题。",
            "骨穿取一点点骨髓样本，腰穿取一点脑脊液。医生会提前告诉你们从哪里取、怎么做。",
            "每一步怎么做，我们提前问清楚，再一起准备。",
          ],
          avoid: ["不承诺「做完这次就再也不用查了」。"],
        },
      ],
    },
    sourceIds: ["stjude-bone-marrow", "nhc-all-apl", "all-pathway"],
    feelingToolIds: ["question-card", "breathing"],
    recoveryTipIds: ["line-care"],
  },
  {
    id: "marathon",
    number: 5,
    title: "治疗马拉松",
    teaser: "化疗、换药阶段和会掉的头发",
    scene: "marathon",
    hue: "leaf",
    scene3dId: "treatment-marathon",
    kidText: [
      "治疗白血病最常用的办法是化疗，就是用药把捣蛋的细胞赶走。",
      "治疗像一场长跑，分好几段。第一段叫诱导，要把大部分捣蛋细胞赶走；接着是巩固，把剩下的继续清理干净；后面是维持，常常是在家按时吃药、定期回医院检查。每个小朋友的跑道长短不一样，医生会告诉你。",
      "化疗药专门对付长得快的细胞，头发里的细胞也长得快，所以很多小朋友的头发会掉。这通常是暂时的，治疗后头发会重新长出来，刚长出来时软软的，像桃子上的绒毛。",
      "有的小朋友身上会放一根软软的管子，叫 PICC 或输液港，打针输液就不用每次都扎新地方。",
    ],
    remember: "治疗分好几段，掉头发通常是暂时的。",
    grownUp: {
      points: [
        "诱导、巩固、维持是儿童 ALL 临床路径中的阶段名称。不同分型、危险度和方案的阶段安排不同，具体时长按孩子的治疗方案。",
        "毛发脱落原文：化疗攻击快速分裂的细胞，包括毛囊；并非所有化疗药都会导致脱发；新发起初像「桃子绒毛」，恢复浓密可能需要 6–12 个月。",
        "PICC 从手臂静脉置入；输液港完全埋在皮下，需要时用专用针连接。维护、洗澡和异常情况按医院护士宣教处理。",
      ],
      boundary: "孩子的方案以主治医生为准。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "治疗像长跑，一段一段来，我们会陪着你。",
            "掉头发是药的影响，以后还会长出来。",
            "累了就说，我们可以停下来休息。",
          ],
          avoid: ["不说「忍一忍就过去了」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "治疗分诱导、巩固、维持等阶段，每个人的安排不一样。",
            "化疗会攻击长得快的细胞，头发也可能暂时脱落。",
            "具体方案和每一步要多久，以你的医生安排为准。",
          ],
          avoid: ["不拿别人的疗程给孩子做比较。"],
        },
      ],
    },
    sourceIds: ["stjude-leukemia", "all-pathway", "stjude-hair-loss"],
    feelingToolIds: ["courage-sticker", "breathing"],
    recoveryTipIds: ["fatigue", "mouth-skin", "nutrition", "line-care", "bones"],
  },
  {
    id: "shield",
    number: 6,
    title: "身体的盾牌",
    teaser: "小卫士变少时，怎么帮身体挡病菌",
    scene: "shield",
    hue: "mint",
    scene3dId: "shield-camp",
    kidText: [
      "化疗的时候，白细胞小卫士有时会变得很少，病菌更容易趁机捣乱。这时候要给自己举起小盾牌。",
      "勤洗手，离生病的人远一点，按医生说的戴口罩。用软毛牙刷刷牙，吃熟透的食物。白细胞少的时候，毛绒玩具、小动物和花草先放一放。",
      "最重要的一条：觉得发烧、发冷或者很不舒服，要马上告诉大人。",
    ],
    remember: "发烧了，马上告诉大人。",
    grownUp: {
      points: [
        "圣犹达原文：中性粒细胞减少的患者出现发热或感染属于医疗急症；发现孩子发烧或有其他感染症状，请立即联系医疗团队或前往急诊。务必遵循护理团队关于发热的指导。",
        "首都儿科研究所的居家建议：家长戴口罩并定时更换，接触孩子前洗手；用软毛牙刷；白细胞或中性粒细胞低时水果要加工至熟透；不养小动物、室内不摆放植物、不给孩子玩毛绒玩具；定时开窗通风。",
      ],
      boundary: "多少度算发热、什么时候必须回医院，以治疗医院给你的书面要求为准。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "白细胞变少时，病菌容易靠近，我们要勤洗手。",
            "发烧、发冷要马上告诉大人，不要等到明天。",
            "戴口罩、吃熟的食物，是在保护你。",
          ],
          avoid: ["不说「你怎么又生病了」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "治疗期间白细胞可能下降，感染风险会增加。",
            "发烧或发冷要立即联系治疗团队，按医院要求处理。",
            "不自己吃退烧药或抗生素，先问医生。",
          ],
          avoid: ["不根据体温自己决定要不要去医院。"],
        },
      ],
    },
    sourceIds: ["stjude-fever", "sciping-leukemia"],
    feelingToolIds: ["courage-sticker"],
    recoveryTipIds: ["infection", "emergency", "home"],
  },
  {
    id: "school",
    number: 7,
    title: "回到学校和朋友",
    teaser: "慢慢来，别人也需要学习怎么和你相处",
    scene: "school",
    hue: "rose",
    scene3dId: "recovery-garden",
    kidText: [
      "等你身体好一点，可以慢慢回到学校。什么时候回、怎么回，医生会和爸爸妈妈一起商量，不用着急。",
      "白血病不会传染。同学坐在你旁边、和你一起玩，都不会被传上。这一点可以放心地告诉大家。",
      "同学可能会问你很多问题：你的头发怎么了？你为什么容易累？你不用每个都回答。可以提前想好一两句，也可以请老师帮忙向大家解释。",
      "家里的弟弟妹妹如果觉得被冷落、有点生气，也是正常的心情。大人可以告诉他们发生了什么，也可以让他们帮忙做一些陪伴的小事。",
    ],
    remember: "你可以慢慢来，别人也需要学习怎么和你相处。",
    grownUp: {
      points: [
        "圣犹达家长指南把「上学该怎么办」列为孩子常问的问题之一。返校的时间和方式请结合治疗阶段、血象恢复情况和治疗团队的意见，分阶段进行，可以先从半天或线上参与开始。",
        "返校前和老师、校医沟通孩子的体力状况、感染防护、复诊安排，以及同学提问时怎么回应。让孩子自己决定愿意说到什么程度，不替孩子隐瞒，也不强迫孩子讲述。",
        "手足常被家庭重心转移影响。家长指南建议用符合年龄的方式告诉家里其他孩子发生了什么，允许他们表达害怕、生气和内疚，并安排只属于他们的陪伴时间。",
      ],
      boundary:
        "返校时间和方式因治疗阶段和孩子状态差异很大，请以治疗团队的意见为准。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "白血病不会传染，同学可以和你一起上课、一起玩。",
            "你累了可以休息，不用一下子回到以前的节奏。",
            "同学问问题，你可以回答，也可以说「我现在不想说」。",
          ],
          avoid: ["不逼孩子「什么都跟同学讲清楚」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "返校可以分阶段，先半天或先上喜欢的课，再慢慢增加。",
            "同学可能好奇头发和体力，你可以先想好一两句。",
            "什么时候返校、能参加什么活动，和治疗团队、学校一起商量。",
          ],
          avoid: ["不承诺「下周就能完全跟上」。"],
        },
      ],
    },
    sourceIds: ["stjude-talking"],
    feelingToolIds: ["school-theater", "sibling"],
    recoveryTipIds: ["school", "vaccines"],
  },
  {
    id: "followup",
    number: 8,
    title: "复查与长期随访",
    teaser: "治疗结束后，还要按时回医院看看",
    scene: "followup",
    hue: "lilac",
    scene3dId: "treatment-marathon",
    kidText: [
      "治疗结束、感觉身体很棒的时候，还是要按时回医院复查。",
      "复查就像给身体做定期检查：医生看看小帮手们够不够强壮，也看看你长高了没有、精神好不好。",
      "离治疗结束越久，回医院检查的次数一般会越少。什么时候回去复查，医生会写在复查单上告诉你和家人。",
      "如果还没到复查的日子，你就觉得不舒服，不用等到那一天，告诉大人，早点去医院看看。",
    ],
    remember: "治疗结束后还要按时复查。",
    grownUp: {
      points: [
        "儿童 ALL 临床路径包含结束治疗后的随访安排；随访目的是监测疾病状态、治疗相关毒性和生长发育情况。",
        "诊疗规范要求治疗结束后定期随访。长期随访关注生长发育、内分泌、心功能和第二肿瘤等问题。",
        "疫苗补种、恢复集体活动和运动的时间，请按治疗团队的安排执行。建议家长把日常观察到的问题记下来，随访时集中询问。",
      ],
      boundary:
        "随访的时间、项目和频率，以孩子所在治疗团队的安排为准。",
      scripts: [
        {
          ageBand: "6-8",
          say: [
            "治疗结束以后，还要按时回医院看看。",
            "复查是看看身体长得好不好，不是因为你做错了什么。",
            "如果还没到复查就不舒服，也要告诉大人。",
          ],
          avoid: ["不说「再也不用来医院了」。"],
        },
        {
          ageBand: "9-12",
          say: [
            "治疗结束后仍需定期随访，检查生长发育和身体功能。",
            "复查间隔通常会按安排调整，具体时间看复查单。",
            "把平时的问题记下来，复查时一起问医生。",
          ],
          avoid: ["不自行决定取消或推迟复查。"],
        },
      ],
    },
    sourceIds: ["all-pathway", "nhc-all-apl", "stjude-leukemia"],
    feelingToolIds: ["question-card", "sibling"],
    recoveryTipIds: ["vaccines", "emergency"],
  },
];

export const chapters: Chapter[] = rawChapters.map(
  (chapter) => chapterSchema.parse(chapter) as Chapter,
);

export function getChapter(id: string | undefined): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === id);
}
