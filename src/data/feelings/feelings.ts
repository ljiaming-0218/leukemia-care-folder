import { z } from "zod";

export const FEELING_TOOL_IDS = [
  "weather",
  "breathing",
  "not-your-fault",
  "question-card",
  "courage-sticker",
  "sibling",
  "school-theater",
] as const;

export type FeelingToolId = (typeof FEELING_TOOL_IDS)[number];

const feelingToolSchema = z.object({
  id: z.enum(FEELING_TOOL_IDS),
  title: z.string().min(1),
  ageBand: z.string().min(1),
  intro: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  caution: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
});

export const feelingTools = z.array(feelingToolSchema).parse([
  {
    id: "weather",
    title: "情绪天气预报",
    ageBand: "6–12 岁",
    intro: "今天的心情像什么天气？选一个，再看看可以告诉谁。",
    steps: ["选一个最像今天的天气。", "如果愿意，把这句话说给一个大人听。"],
    caution: "不存档、不上传、不分析。选完就过去，没有对错。",
    sourceIds: ["stjude-talking"],
  },
  {
    id: "breathing",
    title: "吹泡泡呼吸",
    ageBand: "6–12 岁",
    intro: "慢慢吸气，像闻一朵花；慢慢呼气，像吹一个大泡泡。",
    steps: ["坐稳，肩膀放松。", "吸气数到 3，呼气数到 4，做 3 轮。", "不舒服就停下来，告诉大人。"],
    caution: "头晕、胸闷时马上停止，找大人。",
    sourceIds: ["stjude-talking"],
  },
  {
    id: "not-your-fault",
    title: "不是你的错",
    ageBand: "6–12 岁",
    intro: "有些事听起来像真的，其实不是。我们一起分辨一下。",
    steps: ["读一句话，选「对」或「不对」。", "看看解释，再读一遍「记住这一句」。"],
    caution: "要不要告诉别人，由孩子和家人一起决定。",
    sourceIds: ["stjude-leukemia", "stjude-talking"],
  },
  {
    id: "question-card",
    title: "问题卡",
    ageBand: "6–12 岁，家长陪读",
    intro: "把最想问医生的 3 个问题写下来，下次复诊带去。",
    steps: ["写下 3 个问题，可以很短。", "点「复制」带去给医生看，或点「打印」。", "医生回答后，可以在旁边画个记号。"],
    caution: "问题卡只在本页保存，刷新就清空。",
    sourceIds: ["stjude-talking"],
  },
  {
    id: "courage-sticker",
    title: "勇气贴纸",
    ageBand: "6–12 岁",
    intro: "做完一件不容易的事，就给自己一张贴纸。",
    steps: ["选一件今天做到的事。", "给自己一张贴纸，说一句「我很勇敢」。"],
    caution: "你想贴的时候再贴，没有排名，也没有连续签到。",
    sourceIds: ["stjude-talking"],
  },
  {
    id: "sibling",
    title: "手足心情",
    ageBand: "哥哥姐姐弟弟妹妹",
    intro: "家里的注意力常常给了生病的那一个。你的心情也重要。",
    steps: ["选一个最像你的心情。", "写一句想让爸爸妈妈知道的话。", "把这句话念给他们听，或者给他们看。"],
    caution: "你的心情也重要，可以找机会说给家里人听。",
    sourceIds: ["stjude-talking"],
  },
  {
    id: "school-theater",
    title: "返校小剧场",
    ageBand: "9–12 岁",
    intro: "同学可能会问一些问题。先在这里练一练，回到学校就没那么紧张。",
    steps: ["读一个场景。", "选一句你最想说的话，看看会有什么感觉。", "不喜欢的答案可以换一句，或者请大人一起想。"],
    caution: "要不要说、说多少，按自己的意愿和家里商量的来。",
    sourceIds: ["stjude-talking"],
  },
]);

export const FEELING_ENTRIES = [
  {
    id: "scared",
    label: "害怕",
    toolId: "breathing",
    reason: "先让呼吸慢下来，身体会没那么紧。",
    line: "「我有点害怕，你可以陪我待一会儿吗？」",
  },
  {
    id: "angry",
    label: "生气",
    toolId: "weather",
    reason: "先把这股气说出来，不用马上变好。",
    line: "「我现在很生气，想先安静一下。」",
  },
  {
    id: "sad",
    label: "难过",
    toolId: "weather",
    reason: "先给今天的心情起个名字，不用马上好起来。",
    line: "「我今天有点难过，可以抱抱我吗？」",
  },
  {
    id: "quiet",
    label: "不想说话",
    toolId: "weather",
    reason: "不用开口，指一指今天的天气也可以。",
    line: "「我现在不想说话，你可以坐在我旁边吗？」",
  },
  {
    id: "self-blame",
    label: "怪自己",
    toolId: "not-your-fault",
    reason: "有些责怪自己的话，可以先分辨一下。",
    line: "「我有点怪自己，可以陪我看看吗？」",
  },
  {
    id: "school-worry",
    label: "担心回学校",
    toolId: "school-theater",
    reason: "先在安全的地方练一练，再决定怎么说。",
    line: "「我有点担心回学校，可以和我练一练吗？」",
  },
] as const;

export type FeelingEntryId = (typeof FEELING_ENTRIES)[number]["id"];

export const WEATHER_OPTIONS = [
  { id: "sunny", label: "晴天", line: "今天心情亮亮的。可以把开心的事说给大人听。" },
  { id: "cloudy", label: "多云", line: "有点闷闷的，说不清为什么。可以告诉大人「我今天有点闷」。" },
  { id: "rainy", label: "下雨", line: "今天想哭，或者很难过。难过的时候，可以找一个大人陪你待一会儿。" },
  { id: "stormy", label: "打雷", line: "今天很生气，或者很害怕。生气和害怕都可以说出来，不是坏孩子。" },
  { id: "rainbow", label: "彩虹", line: "今天又开心又难过，两种心情可以住在一起。" },
] as const;

export const FAULT_QUESTIONS = [
  {
    statement: "我生病，是因为我做错了什么。",
    answer: false,
    explain: "不是的。白血病不是因为你调皮、不听话或者吃了什么才得的，也不是你的错。",
  },
  {
    statement: "白血病会通过一起玩、一起吃饭传染给同学。",
    answer: false,
    explain: "不会。白血病不是传染病，一起玩、一起吃饭不会传染给别人。",
  },
  {
    statement: "我可以生气、害怕、难过，也可以把这些心情说出来。",
    answer: true,
    explain: "对。每一种心情都是正常的。说出来，大人才能知道怎么陪你。",
  },
] as const;

export const SIBLING_MOODS = ["有点被忽略", "担心弟弟妹妹", "生气", "也想被抱一抱", "说不清"] as const;

export const THEATER_SCENARIOS = [
  {
    id: "why-hair",
    situation: "同学问：「你的头发怎么变少了？」",
    options: [
      { text: "「我在治疗，头发会慢慢长回来。这个话题我不想多聊。」", good: true, reply: "说出了事实，也画出了自己的边界，很好。" },
      { text: "「不关你的事。」", good: false, reply: "这样说会让自己舒服一点，但可能让对话卡住。也可以试试更直接地说「我不想聊这个」。" },
      { text: "编一个别的理由。", good: false, reply: "你不需要为生病道歉，也不用编理由。想保密也可以，但不用觉得羞耻。" },
    ],
  },
  {
    id: "is-it-contagious",
    situation: "同学问：「跟你玩会不会被传染？」",
    options: [
      { text: "「白血病不传染，一起玩没事。」", good: true, reply: "对，白血病不是传染病。你可以把这个告诉同学。" },
      { text: "「会，你别靠近我。」", good: false, reply: "这样会让自己更孤单。如果不想解释，可以请老师帮忙说。" },
      { text: "不知道怎么说，走开了。", good: false, reply: "走开也没关系。你可以先告诉老师或爸爸妈妈，再决定怎么回答。" },
    ],
  },
  {
    id: "join-game",
    situation: "同学问：「你能和我们一起跑吗？」",
    options: [
      { text: "「我今天体力不够，可以在旁边看，或者一起玩安静的。」", good: true, reply: "说出了自己的限度，也给了替代办法，很好。" },
      { text: "硬撑着去跑。", good: false, reply: "不用为了合群勉强身体。累了就休息，朋友会理解的。" },
      { text: "「我不能玩，你们别管我。」", good: false, reply: "生病不代表不能交朋友。可以试试告诉同学你能做什么。" },
    ],
  },
] as const;

export const COURAGE_ACTS = ["做完一次检查", "按时吃药", "去复诊", "把心里话说给大人听", "回到学校上了一节课"] as const;

export const PARENT_SCRIPTS = [
  {
    age: "6–8 岁",
    title: "用短句说当下会发生什么",
    lines: [
      "「等一下护士阿姨会给你抽一点点血，会像小蚂蚁咬一下，你可以握着我的手。」",
      "「今天我们要在医院住一晚，妈妈会一直在这里。」",
    ],
  },
  {
    age: "9–12 岁",
    title: "多给原因，也给他参与感",
    lines: [
      "「医生要看血里的细胞够不够，才知道下一步怎么安排。你想先问医生哪个问题？」",
      "「治疗会分几段，每段要做的事不一样。我们可以一起把它记下来。」",
    ],
  },
  {
    age: "所有年龄",
    title: "可以说的和不必说的",
    lines: [
      "可以说：「现在我们在做能做的事，有变化我会告诉你。」",
      "不必说：「没事的，很快就好。」不确定的事，就说「我们一起去问医生」。",
      "明确说：「生病不是你的错，白血病不传染。」",
    ],
  },
] as const;

export const SEEK_HELP_SIGNS = [
  "持续两周以上情绪低落，或者对以前喜欢的事都提不起兴趣。",
  "睡眠、食欲明显改变，持续一段时间。",
  "拒绝治疗、频繁哭泣，或者出现伤害自己的言语和行为。",
  "严重惊恐、喘不过气，或者长时间无法平静。",
] as const;

export const SEEK_HELP_STEPS = [
  "先联系孩子所在医院的治疗团队，说明最近的变化。",
  "请治疗团队转介儿童心理科或精神科。",
  "紧急情况按急救流程处理，或联系当地官方心理援助热线。",
] as const;
