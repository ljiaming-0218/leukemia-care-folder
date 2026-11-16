import {
  assistantEntries,
  type AssistantAction,
  type AssistantEntry,
  type AssistantSection,
  type AssistantSource,
} from "@/src/features/assistant/knowledge";
import { glossaryEntries } from "@/src/data/knowledge/glossary";
import type { GlossaryEntry } from "@/src/domain/schemas";

export type AssistantReplyKind = "answer" | "safety" | "refusal" | "fallback";

export type AssistantReply = {
  kind: AssistantReplyKind;
  title?: string;
  paragraphs: string[];
  bullets?: string[];
  sections?: AssistantSection[];
  sources: AssistantSource[];
  actions?: AssistantAction[];
  suggestions?: string[];
};

export const assistantSuggestedQuestions = [
  "孩子刚确诊，先搞清什么？",
  "骨穿、免疫分型、基因检测有什么区别？",
  "MRD 是什么？",
  "化疗分几个阶段？",
  "跨省就医要查哪三件事？",
  "小鹿灯能报哪些费用？",
  "想给孩子筹款，先做什么？",
];

export const assistantWelcome: AssistantReply = {
  kind: "answer",
  paragraphs: [
    "我可以查站内已核对的科普、术语、医保、小鹿灯和同路人故事，也能带你找到票据整理入口。",
    "我只回答站内资料范围内的内容，不看病历、不判断病情，也不替代医生。涉及孩子当前症状、检查结果和用药的问题，请直接联系治疗医院。",
  ],
  bullets: [
    "请勿输入姓名、证件号、病历号、联系方式或票据内容。",
    "如果孩子正在出现急症，请直接联系治疗医院或就近急诊，不要等待网页回答。",
  ],
  sources: [],
  suggestions: assistantSuggestedQuestions,
};

const EMERGENCY =
  /(高烧|高热|发烧|发热|体温\s*3[89]|39\s*度|40\s*度|出血|流血|呼吸困难|喘不上气|抽搐|惊厥|昏迷|意识不清|精神差|精神反应差|脸色苍白|嘴唇发紫|剧烈头痛|呕吐不止)/;
const DIAGNOSIS_REQUEST =
  /(是不是白血病|会不会是白血病|能确诊吗|确诊了吗|帮我看看|看化验|看血常规|化验单|报告单|白细胞高|血小板低|骨穿结果|基因报告)/;
const TREATMENT_REQUEST =
  /(怎么治|治疗方案|化疗方案|化疗吃什么|吃什么药|用药|剂量|靶向药|要不要移植|偏方|中药方|怎么用药|吃多少)/;
const PROGNOSIS_REQUEST =
  /(治愈率|能治好吗|能不能治好|活多久|生存期|预后|严重吗|会死吗|危险吗)/;
const DIET_REQUEST = /(能吃什么|吃什么好|忌口|营养|食谱|食补|能喝.*吗|能吃.*吗)/;
const DEFINITION_REQUEST =
  /(什么是|是什么|指什么|是什么意思|是查什么|查什么|干什么用|有什么用|作用是什么|代表什么|含义|怎么理解)/;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{Script=Han}a-z0-9]+/gu, "");
}

function bigrams(value: string): Set<string> {
  const result = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    result.add(value.slice(index, index + 2));
  }
  return result;
}

function overlap(query: Set<string>, target: Set<string>): number {
  if (query.size === 0) return 0;
  let hits = 0;
  for (const token of query) {
    if (target.has(token)) hits += 1;
  }
  return hits / query.size;
}

function entryText(entry: AssistantEntry): string {
  return [
    entry.answer.join(""),
    ...(entry.sections ?? []).flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
    ]),
  ].join("");
}

function scoreEntry(entry: AssistantEntry, normalizedQuery: string): number {
  let score = 0;
  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 12 + Math.min(normalizedKeyword.length, 6);
    } else if (
      normalizedKeyword.length >= 2 &&
      normalizedQuery.length >= 2 &&
      normalizedKeyword.includes(normalizedQuery)
    ) {
      score += 6;
    }
  }

  const queryBigrams = bigrams(normalizedQuery);
  const titleScore = overlap(queryBigrams, bigrams(normalize(entry.title)));
  const questionScore = Math.max(
    ...entry.questions.map((question) => overlap(queryBigrams, bigrams(normalize(question)))),
  );
  const bodyScore = overlap(queryBigrams, bigrams(normalize(entryText(entry))));
  return score + titleScore * 8 + questionScore * 7 + bodyScore * 2;
}

function relatedSuggestions(
  results: { entry: AssistantEntry; score: number }[],
  excludeId: string,
): string[] {
  return results
    .filter((result) => result.entry.id !== excludeId && result.score >= 4)
    .slice(0, 2)
    .map((result) => result.entry.questions[0]);
}

function emergencyReply(): AssistantReply {
  return {
    kind: "safety",
    paragraphs: [
      "如果孩子正在出现高热、呼吸困难、明显出血、抽搐、意识不清或精神反应差，请立即联系治疗医院或就近急诊，不要等待网页回答。",
      "化疗后中性粒细胞可能很低，发热有时提示严重感染，不能按普通感冒在家观察。去医院时带上体温记录、正在使用的药物清单、最近一次血常规和医院联系方式。",
      "我不能根据文字描述判断病情，也不能给出退烧药、抗生素或剂量建议。",
    ],
    sources: [],
    suggestions: ["化疗后发热为什么要马上联系医院？", "复诊要问医生什么？"],
    actions: [
      { label: "查术语：发热性中性粒细胞减少", to: "/learn#term-febrile-neutropenia" },
      { label: "准备问题单", to: "/learn#questions-before-visit" },
    ],
  };
}

function diagnosisRefusal(): AssistantReply {
  return {
    kind: "refusal",
    paragraphs: [
      "我不能根据症状、血常规或一张报告判断是不是白血病，也不解读化验单和基因报告。",
      "把报告原件和医院要求的材料带给主治医生，请医生结合检查过程和孩子的情况解释。如果孩子正在高热、出血或呼吸困难，请立即联系治疗医院或就近急诊。",
    ],
    sources: [],
    suggestions: ["骨穿、免疫分型、基因检测有什么区别？", "复诊要问医生什么？"],
    actions: [{ label: "看检查名词解释", to: "/learn#tests-difference" }],
  };
}

function treatmentRefusal(): AssistantReply {
  return {
    kind: "refusal",
    paragraphs: [
      "我不能提供治疗方案、药物选择、剂量、是否移植或偏方建议。这些决定需要主治医生根据分型、危险度和孩子的具体情况作出。",
      "药物名称和作用可以在术语表里查到，但「该不该用、用多少、用多久」必须由治疗医院决定。",
    ],
    sources: [],
    suggestions: ["化疗分几个阶段？", "复诊要问医生什么？"],
    actions: [
      { label: "查用药术语", to: "/learn#glossary" },
      { label: "准备问题单", to: "/learn#questions-before-visit" },
    ],
  };
}

function prognosisRefusal(): AssistantReply {
  return {
    kind: "refusal",
    paragraphs: [
      "我不能提供治愈率、生存期或「严重不严重」的判断。不同分型、危险度和个体情况差异很大，通用数字不能替代主治医生对孩子的当面评估。",
      "可以请医生解释孩子目前的分型、危险度分层和下一步安排，并把要点记下来。",
    ],
    sources: [],
    suggestions: ["复诊要问医生什么？", "孩子刚确诊，先搞清什么？"],
    actions: [{ label: "准备问题单", to: "/learn#questions-before-visit" }],
  };
}

function dietRefusal(): AssistantReply {
  return {
    kind: "refusal",
    paragraphs: [
      "本站没有收录饮食、忌口或营养方案，不能根据治疗阶段给食谱建议。",
      "孩子的饮食需要结合血象、消化情况和用药由治疗团队判断，请咨询主治医生或医院营养科。",
    ],
    sources: [],
    suggestions: ["复诊要问医生什么？", "文件会上传吗？"],
  };
}

type GlossaryMatch = { entry: GlossaryEntry; exact: boolean };

function findGlossaryEntry(
  question: string,
  normalizedQuery: string,
): GlossaryMatch | null {
  const wantsDefinition = DEFINITION_REQUEST.test(question);
  const definitionCore = normalizedQuery.replace(
    /(是什么意思|是什么意思|是什么|什么是|何为|指什么|什么意思|是查什么|查什么|干什么用|有什么用|作用是什么|代表什么|含义|怎么理解)/g,
    "",
  );
  let best: { entry: GlossaryEntry; length: number; exact: boolean } | null = null;

  for (const entry of glossaryEntries) {
    const candidates = [entry.term, ...entry.aka].map(normalize).filter(Boolean);
    const exact = candidates.some(
      (term) => normalizedQuery === term || definitionCore === term,
    );
    const mentioned = candidates.some((term) => normalizedQuery.includes(term));
    if (!exact && !(wantsDefinition && mentioned)) continue;
    const length = Math.max(...candidates.map((term) => term.length));
    if (
      !best ||
      (exact && !best.exact) ||
      (exact === best.exact && length > best.length)
    ) {
      best = { entry, length, exact };
    }
  }

  return best ? { entry: best.entry, exact: best.exact } : null;
}

function glossaryReply(entry: GlossaryEntry): AssistantReply {
  const linked = entry.entryId
    ? assistantEntries.find((candidate) => candidate.id === entry.entryId)
    : undefined;
  const paragraphs = [entry.plain];
  if (entry.detail) paragraphs.push(entry.detail);
  if (entry.caution) paragraphs.push(entry.caution);

  const sources: AssistantSource[] = [
    {
      label: entry.sourceName,
      url: entry.sourceUrl,
      verifiedAt: entry.verifiedAt,
    },
  ];
  for (const source of linked?.sources ?? []) {
    const duplicate = sources.some(
      (item) => item.label === source.label || (item.url && item.url === source.url),
    );
    if (!duplicate) sources.push(source);
  }

  const actions: AssistantAction[] = [
    { label: "在术语表里打开", to: `/learn#term-${entry.id}` },
  ];
  for (const action of linked?.actions ?? []) {
    if (actions.some((item) => item.to === action.to)) continue;
    actions.push(action);
  }

  const suggestions = (linked?.questions ?? [])
    .filter((question) => !DEFINITION_REQUEST.test(question))
    .slice(0, 2);

  return {
    kind: "answer",
    title: `术语：${entry.term}`,
    paragraphs,
    sections: linked?.sections,
    sources,
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["复诊要问医生什么？", "骨穿、免疫分型、基因检测有什么区别？"],
    actions,
  };
}

function fallbackReply(results: { entry: AssistantEntry; score: number }[]): AssistantReply {
  const suggestions = results
    .filter((result) => result.score >= 3)
    .slice(0, 3)
    .map((result) => result.entry.questions[0]);

  return {
    kind: "fallback",
    paragraphs: [
      "我在站内已核对的资料里没有找到能直接回答这个问题的内容。",
      "可以换一个更短的说法，或先查科普、术语表、我家的路线和小鹿灯材料提醒。涉及孩子病情、检查结果和用药的问题，请直接问主治医生。",
    ],
    sources: [],
    suggestions: suggestions.length > 0 ? suggestions : assistantSuggestedQuestions.slice(0, 3),
    actions: [
      { label: "去白血病科普", to: "/learn" },
      { label: "查术语表", to: "/learn#glossary" },
      { label: "排我家的路线", to: "/route" },
    ],
  };
}

export function answerQuestion(rawQuestion: string): AssistantReply {
  const question = rawQuestion.replace(/\s+/g, " ").trim().slice(0, 500);
  if (!question) return fallbackReply([]);

  const normalizedQuery = normalize(question);
  const glossaryMatch = findGlossaryEntry(question, normalizedQuery);
  const results = assistantEntries
    .map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score);
  const bestScore = results[0]?.score ?? 0;

  if (glossaryMatch?.exact) return glossaryReply(glossaryMatch.entry);
  if (EMERGENCY.test(question)) return emergencyReply();
  if (DIAGNOSIS_REQUEST.test(question)) return diagnosisRefusal();

  if (glossaryMatch && bestScore < 12) return glossaryReply(glossaryMatch.entry);

  if (TREATMENT_REQUEST.test(question)) return treatmentRefusal();
  if (PROGNOSIS_REQUEST.test(question)) return prognosisRefusal();
  if (DIET_REQUEST.test(question)) return dietRefusal();

  const best = results[0];
  if (!best || best.score < 6) return fallbackReply(results);

  const entry = best.entry;
  const suggestions = relatedSuggestions(results, entry.id);
  return {
    kind: "answer",
    paragraphs: entry.answer,
    bullets: entry.bullets,
    sections: entry.sections,
    sources: entry.sources,
    actions: entry.actions,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}
