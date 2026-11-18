import { z } from "zod";

export const RECOVERY_CATEGORIES = [
  "感染预防",
  "口腔与皮肤",
  "营养与食欲",
  "疲劳与活动",
  "骨骼与关节",
  "管路护理",
  "返校与学习",
  "疫苗与复诊",
  "居家环境",
  "紧急情况",
] as const;

export const RECOVERY_STAGES = ["住院治疗", "化疗间歇", "维持期", "治疗结束后"] as const;

const recoveryTipSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(RECOVERY_CATEGORIES),
  stages: z.array(z.enum(RECOVERY_STAGES)).min(1),
  title: z.string().min(1),
  do: z.array(z.string().min(1)).min(1),
  dont: z.array(z.string().min(1)).min(1),
  whenToCall: z.array(z.string().min(1)).min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type RecoveryTip = z.infer<typeof recoveryTipSchema>;
export type RecoveryCategory = (typeof RECOVERY_CATEGORIES)[number];
export type RecoveryStage = (typeof RECOVERY_STAGES)[number];

const verifiedAt = "2026-11-18";

export const recoveryTips: RecoveryTip[] = z.array(recoveryTipSchema).parse([
  {
    id: "infection",
    category: "感染预防",
    stages: ["住院治疗", "化疗间歇", "维持期"],
    title: "小卫士变少时，怎么挡病菌",
    do: [
      "饭前便后、外出回来，用肥皂和流水洗手。",
      "去医院或人多的地方，按医生说的戴口罩。",
      "食物吃熟透的，水果洗净削皮；家里每天开窗通风。",
      "家人感冒时戴口罩、分开毛巾和餐具。",
    ],
    dont: [
      "不吃生食、不喝生水，不共用水杯。",
      "小卫士很少时，先不去人多拥挤的地方和探视多的聚会。",
      "不自己停药或改药，按治疗团队安排来。",
    ],
    whenToCall: ["发烧或发冷", "咳嗽加重、呼吸变快", "精神明显变差、叫不醒"],
    sourceIds: ["stjude-fever", "school-vaccines"],
    verifiedAt,
  },
  {
    id: "mouth-skin",
    category: "口腔与皮肤",
    stages: ["住院治疗", "化疗间歇", "维持期"],
    title: "嘴巴和皮肤的小伤口，要早点说",
    do: [
      "用软毛牙刷早晚刷牙，饭后用清水或医生建议的漱口水漱口。",
      "皮肤用温水轻轻清洁，洗后拍干，剪短指甲。",
      "衣服选宽松柔软的，减少摩擦。",
    ],
    dont: [
      "不吃过烫、过辣、过硬的食物。",
      "不抓挠皮疹和破皮的地方，不自己涂药膏或偏方。",
      "口腔溃疡影响吃饭时，不要硬扛。",
    ],
    whenToCall: ["口腔溃疡疼得吃不下、喝不下", "皮肤破损、流脓或红肿变大", "皮疹同时发烧"],
    sourceIds: ["oral-care", "stjude-fever"],
    verifiedAt,
  },
  {
    id: "nutrition",
    category: "营养与食欲",
    stages: ["住院治疗", "化疗间歇", "维持期", "治疗结束后"],
    title: "吃得少的时候，分成很多小份",
    do: [
      "少量多餐，一天可以吃五到六次。",
      "主食、蛋奶肉、蔬菜水果换着来，食物做熟做软。",
      "两餐之间小口喝水，保持口腔湿润。",
      "胃口变化、体重下降，都告诉治疗团队。",
    ],
    dont: [
      "不强迫孩子一顿吃很多。",
      "不用偏方、补品代替正常吃饭。",
      "不吃生食和来源不明的保健品。",
    ],
    whenToCall: ["持续不吃不喝超过一天", "体重明显下降", "反复呕吐、腹泻，尿量变少"],
    sourceIds: ["stjude-nutrition", "stjude-nutrition-side-effects"],
    verifiedAt,
  },
  {
    id: "fatigue",
    category: "疲劳与活动",
    stages: ["住院治疗", "化疗间歇", "维持期", "治疗结束后"],
    title: "累了就休息，有力气就动一动",
    do: [
      "按当天体力散步、做伸展，累了马上停。",
      "保证睡眠，白天也允许小睡。",
      "把活动拆成小段，比如走五分钟、歇一会儿。",
    ],
    dont: [
      "不参加容易碰撞的运动，如篮球、足球。",
      "不硬撑、不和别的孩子比运动量。",
      "不长时间躺着看屏幕，久坐后起来活动一下。",
    ],
    whenToCall: ["活动后明显气促、心慌", "骨痛或关节痛加重", "疲劳突然加重，连吃饭洗澡都困难"],
    sourceIds: ["stjude-activity", "stjude-nutrition"],
    verifiedAt,
  },
  {
    id: "bones",
    category: "骨骼与关节",
    stages: ["住院治疗", "维持期", "治疗结束后"],
    title: "腿痛、走路姿势变了，要告诉医生",
    do: [
      "留意孩子是否喊腿痛、不愿走路、总让人抱。",
      "把出现的时间和当时在吃什么药记下来，告诉治疗团队。",
      "需要时由治疗团队转介康复治疗师，按指导做训练。",
      "家里地面防滑，家具尖角包起来，减少跌倒。",
    ],
    dont: [
      "不自行买药、补品或按摩偏方。",
      "不让孩子做剧烈跳跃和容易摔倒的游戏。",
      "不因为怕麻烦而忍着不说。",
    ],
    whenToCall: ["持续骨痛、夜间痛醒", "走路姿势明显改变、拒绝走路", "关节红肿发热"],
    sourceIds: ["steroid-leg-pain", "stjude-activity"],
    verifiedAt,
  },
  {
    id: "line-care",
    category: "管路护理",
    stages: ["住院治疗", "化疗间歇", "维持期"],
    title: "PICC 和输液港：只做医院教过的观察",
    do: [
      "每天看一看敷料有没有卷边、渗液、潮湿。",
      "洗澡前按护士教的方法做好防水，洗后检查敷料。",
      "按医院约定的时间回去维护。",
      "把管路外露的长度记下来，变化时告诉护士。",
    ],
    dont: [
      "不自己冲管、换药、撕敷料。",
      "不用置管侧手臂提重物，不在这一侧量血压。",
      "导管脱出时不要自己往回塞。",
    ],
    whenToCall: ["敷料渗血、渗液或潮湿松动", "穿刺点红肿、疼痛、流脓", "发烧、寒战", "导管脱出或外露变长"],
    sourceIds: ["picc-home-care"],
    verifiedAt,
  },
  {
    id: "school",
    category: "返校与学习",
    stages: ["维持期", "治疗结束后"],
    title: "返校可以慢慢来",
    do: [
      "先和治疗团队、班主任沟通，商量什么时候回、回多久。",
      "可以从半天、只上主要科目开始，再慢慢增加。",
      "准备几张「同学可能会问的问题」小卡片，练习怎么回答。",
      "和学校约定：班里有水痘、麻疹等传染病时先不去。",
    ],
    dont: [
      "不勉强孩子全天上课、参加剧烈活动。",
      "不教孩子隐瞒病情。",
      "不在孩子明显焦虑、拒绝上学时硬逼着去。",
    ],
    whenToCall: ["孩子持续焦虑、肚子痛或拒绝上学", "班里有水痘、麻疹等传染病", "返校后反复发烧或极度疲劳"],
    sourceIds: ["school-vaccines"],
    verifiedAt,
  },
  {
    id: "vaccines",
    category: "疫苗与复诊",
    stages: ["维持期", "治疗结束后"],
    title: "疫苗和复查，都按治疗团队的安排",
    do: [
      "把接种本带上，每次复诊都问一句「现在能打什么疫苗」。",
      "接种前先告诉医生孩子正在用的药。",
      "把复查时间写进日历，提前请假和安排交通。",
    ],
    dont: [
      "不自行补种疫苗。",
      "不自己判断活疫苗能不能打。",
      "不错过复诊；实在去不了，提前联系治疗团队改时间。",
    ],
    whenToCall: ["错过复诊或疫苗时间不清楚", "接触了水痘、麻疹等传染病", "接种后持续高烧或精神差"],
    sourceIds: ["school-vaccines", "stjude-fever"],
    verifiedAt,
  },
  {
    id: "home",
    category: "居家环境",
    stages: ["住院治疗", "化疗间歇", "维持期", "治疗结束后"],
    title: "家里干净、通风、没有烟",
    do: [
      "每天开窗通风，地面和桌面用清水擦干净。",
      "毛巾、水杯、餐具和家人分开，定期清洗。",
      "宠物和花草能不能留，先问治疗团队。",
      "家里有人感冒时戴口罩、少接触。",
    ],
    dont: [
      "不在室内吸烟，也不带孩子去有二手烟的地方。",
      "不在小卫士很少时接待很多探视。",
      "不把生食和熟食放在同一块砧板上。",
    ],
    whenToCall: ["家里有人患水痘、麻疹、流感等传染病", "孩子发烧或精神差", "家中环境潮湿发霉，无法清理"],
    sourceIds: ["stjude-fever", "school-vaccines"],
    verifiedAt,
  },
  {
    id: "emergency",
    category: "紧急情况",
    stages: ["住院治疗", "化疗间歇", "维持期", "治疗结束后"],
    title: "这些情况，马上联系医院或急救",
    do: [
      "把治疗医院的联系方式写在冰箱和手机里。",
      "发烧时先量体温、记下时间，马上告诉治疗团队。",
      "出血时用干净纱布持续按压，同时准备去医院。",
    ],
    dont: [
      "不等到第二天再说。",
      "不自己吃退烧药、止痛药掩盖症状。",
      "不把呼吸困难、抽搐的孩子单独留在家里。",
    ],
    whenToCall: [
      "发烧、寒战，尤其刚做完治疗",
      "出血不止、皮肤出现大片瘀斑",
      "呼吸困难、嘴唇发紫",
      "剧烈头痛、反复呕吐、抽搐、叫不醒",
    ],
    sourceIds: ["stjude-fever"],
    verifiedAt,
  },
]);
