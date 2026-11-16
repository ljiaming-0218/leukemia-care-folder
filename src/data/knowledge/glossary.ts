import {
  glossaryEntriesSchema,
  type GlossaryEntry,
} from "@/src/domain/schemas";

const NHC_LEUKEMIA =
  "https://www.nhc.gov.cn/wjw/zccl/201810/9b618308636847d085ffef867370cacd.shtml";
const NHC_ALL_APL =
  "https://www.nhc.gov.cn/wjw/c100175/201810/bb6112cd824b476b8b6dc7495c3f7b42.shtml";
const ALL_PATHWAY =
  "https://ylbzj.qdn.gov.cn/lclj/xylptb/2019nb/202208/P020220817540095731889.pdf";
const NHSA_TRIPLE = "https://www.nhsa.gov.cn/art/2024/9/10/art_14_13819.html";
const ZJ_OUTPATIENT =
  "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3096/site/attach/0/e65965bb7279428e84c3f7066274f31d.pdf";
const NHSA_CROSS = "https://www.nhsa.gov.cn/art/2022/7/26/art_104_8629.html";
const NHSA_2025_GUIDE = "https://www.nhsa.gov.cn/art/2025/6/7/art_14_16754.html";
const MOF_RECEIPT =
  "https://www.mof.gov.cn/gkml/caizhengwengao/wg201901/wg201908/201912/t20191230_3452059.htm";

const verifiedAt = "2026-11-16";

const SOURCE = {
  nhcLeukemia: {
    sourceName: "国家卫生健康委《儿童白血病救治管理工作材料》",
    sourceUrl: NHC_LEUKEMIA,
  },
  nhcAllApl: {
    sourceName:
      "儿童急性淋巴细胞白血病、儿童急性早幼粒细胞白血病诊疗规范（2018 年版）",
    sourceUrl: NHC_ALL_APL,
  },
  pathway: {
    sourceName: "《儿童急性淋巴细胞白血病临床路径》（2019 年版，地方医保局刊载）",
    sourceUrl: ALL_PATHWAY,
  },
  triple: {
    sourceName: "国家医保局三重保障制度说明",
    sourceUrl: NHSA_TRIPLE,
  },
  zjOutpatient: {
    sourceName: "浙江省医保局浙医保发〔2023〕39 号",
    sourceUrl: ZJ_OUTPATIENT,
  },
  cross: {
    sourceName: "国家医保局跨省异地就医直接结算通知",
    sourceUrl: NHSA_CROSS,
  },
  crossGuide: {
    sourceName: "2025 年跨省异地就医经办说明",
    sourceUrl: NHSA_2025_GUIDE,
  },
  receipt: {
    sourceName: "财政部、国家卫健委、国家医保局医疗收费电子票据通知",
    sourceUrl: MOF_RECEIPT,
  },
  jingning: {
    sourceName: "景宁第五期「小鹿灯—愈见未来」申领公告",
    sourceUrl:
      "https://finance.sina.com.cn/wm/2026-09-21/doc-inispyne8995961.shtml",
  },
} as const;

const rawEntries = [
  {
    id: "leukemia",
    entryId: "diagnosis-type",
    term: "白血病",
    aka: ["血癌"],
    group: "疾病与分型",
    plain:
      "白血病是造血系统的恶性肿瘤：骨髓里产生了大量异常白细胞，挤占正常造血的空间。儿童白血病以急性为主，治疗有专门的儿童方案。",
    detail:
      "家长会听到的「急性」指起病和发展较快，不是对治疗结果或严重程度的判断。具体分型、危险度和治疗方案由主治医生根据骨髓、免疫分型和遗传学检查综合确定。",
    caution: "本站不根据症状、血常规或报告自行判断孩子是否患白血病。",
    source: SOURCE.nhcLeukemia,
  },
  {
    id: "all",
    entryId: "diagnosis-type",
    term: "急性淋巴细胞白血病（ALL）",
    aka: ["ALL", "急淋"],
    group: "疾病与分型",
    plain:
      "白血病的一种，异常增殖的是淋巴细胞系的前体细胞。ALL 是儿童白血病中最常见的类型，治疗通常按儿童专用方案分阶段进行。",
    detail:
      "「B 细胞型」和「T 细胞型」是 ALL 内部的进一步分类，由免疫分型等检查区分。不同亚型的治疗安排可能不同，以医生给出的诊断为准。",
    caution: "本站只解释名词，不判断孩子属于哪一型，也不提供治疗方案。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "aml",
    entryId: "diagnosis-type",
    term: "急性髓系白血病（AML）",
    aka: ["AML", "急髓"],
    group: "疾病与分型",
    plain:
      "白血病的一种，异常增殖的是髓系前体细胞。儿童 AML 比 ALL 少见，但治疗强度和方案与 ALL 不同，需要单独分型。",
    detail:
      "AML 内部还有多个亚型，部分与特定染色体或基因改变相关。分型结果会影响治疗选择，具体由主治医生解释。",
    caution: "本站不提供 AML 的治疗方案、疗程或预后判断。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "apl",
    entryId: "diagnosis-type",
    term: "急性早幼粒细胞白血病（APL）",
    aka: ["APL", "M3"],
    group: "疾病与分型",
    plain:
      "AML 的一种特殊亚型，常与 PML::RARA 融合基因相关。国家有专门的儿童 APL 诊疗规范，治疗路径与一般 AML 不同。",
    detail:
      "因为治疗方式特殊，医生通常会尽快确认相关基因和凝血情况。家长听到「M3」时，可以理解为 APL 的另一种叫法，但以医院报告为准。",
    caution: "APL 的用药和监测必须由治疗医院执行，本站不提供具体方案。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "risk-stratification",
    term: "危险度分层",
    aka: ["危险度", "风险分层", "标危", "中危", "高危"],
    group: "疾病与分型",
    plain:
      "医生根据分型、初诊时的一些检查结果和早期治疗反应，把孩子分到不同风险组，用来决定治疗强度和复查安排。",
    detail:
      "危险度分层不是家长自己能算的评分。不同方案使用的指标和分组名称不完全一样，同一孩子在不同阶段也可能调整。请让医生解释孩子目前属于哪一组、依据是什么。",
    caution: "本站不列具体分层标准，也不把分组直接等同于治疗结果。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "remission",
    term: "完全缓解",
    aka: ["缓解", "CR"],
    group: "疾病与分型",
    plain:
      "治疗后骨髓中的白血病细胞降到很低、正常造血恢复、没有明显髓外病灶，医生会判断为「完全缓解」。",
    detail:
      "缓解不等于治愈，也不等于治疗结束。缓解后仍需继续巩固和维持治疗，并监测微小残留病。判定标准由医生按所用方案执行。",
    caution: "不要根据一次血常规自己判断是否缓解。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "relapse",
    term: "复发",
    aka: ["复发了"],
    group: "疾病与分型",
    plain:
      "缓解后再次出现白血病细胞增多或新的髓外病灶，医生会按方案标准判断是否为复发。",
    detail:
      "复发可能发生在骨髓，也可能在中枢神经系统等部位。发现异常后需要重新检查确认，治疗方案由医生团队根据复发时间、部位和既往治疗决定。",
    caution: "本站不判断复发风险，也不提供复发后的治疗建议。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "bone-marrow-aspiration",
    entryId: "tests-difference",
    term: "骨髓穿刺",
    aka: ["骨穿", "骨髓检查"],
    group: "检查与报告",
    plain:
      "用穿刺针取少量骨髓液做检查，常从髂骨取。它是确认白血病分型、观察治疗反应的重要检查。",
    detail:
      "骨髓液会送去做细胞形态、免疫分型、染色体和基因等检查，所以同一份标本可能对应多张报告。操作过程、麻醉方式和术后观察按医院要求执行。",
    caution: "骨穿结果需要医生结合其他检查解释，本站不解读报告。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "bone-marrow-biopsy",
    entryId: "tests-difference",
    term: "骨髓活检",
    aka: ["骨髓组织活检"],
    group: "检查与报告",
    plain:
      "取一小段骨髓组织，观察骨髓的结构、细胞分布和纤维化情况，和骨髓穿刺的「抽液检查」不是同一件事。",
    detail:
      "医生会根据病情决定是否需要活检。两份报告回答的问题不同，不能互相替代。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "immunophenotype",
    entryId: "tests-difference",
    term: "免疫分型",
    aka: ["免疫表型", "流式分型"],
    group: "检查与报告",
    plain:
      "用带标记的抗体检测细胞表面或细胞内的抗原，判断异常细胞属于哪一系、处于什么分化阶段。它查的不是「免疫力」。",
    detail:
      "儿童白血病常用流式细胞术做免疫分型。报告上会出现 CD 开头的标记名称，这些标记用于分类，不是家长需要自己记住的指标。",
    caution: "本站不根据免疫分型报告判断分型或治疗效果。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "flow-cytometry",
    entryId: "tests-difference",
    term: "流式细胞术",
    aka: ["流式"],
    group: "检查与报告",
    plain:
      "一种细胞检测方法：让细胞逐个通过仪器，根据表面标记和内部特征分类计数。常用于免疫分型和微小残留病检测。",
    detail:
      "同一项技术可以回答不同问题：初诊时用来分型，治疗中用来寻找残留白血病细胞。报告目的不同，解读方式也不同。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "karyotype",
    entryId: "tests-difference",
    term: "染色体核型分析",
    aka: ["染色体检查", "核型"],
    group: "检查与报告",
    plain:
      "在显微镜下观察细胞的染色体数目和结构，发现易位、缺失、增多等异常。结果常写成「46,XX」「t(9;22)」这类格式。",
    detail:
      "染色体异常是白血病分型和危险度判断的重要依据之一。报告中的符号由遗传学实验室和医生解释，家长不需要自己对照。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "fish",
    entryId: "tests-difference",
    term: "荧光原位杂交（FISH）",
    aka: ["FISH"],
    group: "检查与报告",
    plain:
      "用荧光探针在细胞里寻找特定的染色体片段或基因，灵敏度较高，但只检查探针覆盖的目标。",
    detail:
      "FISH 常用来补充普通染色体核型分析，或快速确认某个关键融合基因。阴性结果不代表所有基因都正常。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "fusion-gene",
    entryId: "tests-difference",
    term: "融合基因",
    aka: ["基因融合"],
    group: "检查与报告",
    plain:
      "两个原本分开的基因片段异常拼接在一起，形成新的基因。某些融合基因与白血病分型、危险度或用药选择有关。",
    detail:
      "报告上可能看到 ETV6::RUNX1、BCR::ABL1、PML::RARA 等写法。不同融合基因的意义不同，需要医生结合其他结果解释。",
    caution: "本站不根据某个融合基因推断治疗效果或预后。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "ngs",
    entryId: "tests-difference",
    term: "二代测序",
    aka: ["NGS", "基因测序", "高通量测序"],
    group: "检查与报告",
    plain:
      "一次检测多个基因的突变、融合或拷贝数变化，帮助补充分型、危险度和可能的靶向治疗信息。",
    detail:
      "测序会报告很多变异，其中一部分意义尚不明确。不要把报告上的每个「突变」都理解成严重问题，需由医生和遗传学专业人员结合病情判断。",
    caution: "本站不解读测序报告，也不据此推荐药物。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "mrd",
    entryId: "mrd",
    term: "微小残留病（MRD）",
    aka: ["MRD", "微小残留病灶", "残留病"],
    group: "检查与报告",
    plain:
      "治疗达到缓解后，用流式细胞术或分子方法检测体内是否还有少量用显微镜看不到的白血病细胞。",
    detail:
      "MRD 是评估治疗反应和复发风险的重要指标，治疗过程中会按方案多次复查。检测方法、灵敏度和「阴性/阳性」的判定标准由实验室和方案规定，不能拿不同医院、不同方法的结果直接比较。",
    caution: "MRD 结果必须由主治医生解释，本站不判断孩子是否安全或需要调整治疗。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "lumbar-puncture",
    entryId: "lumbar-puncture",
    term: "腰椎穿刺",
    aka: ["腰穿"],
    group: "检查与报告",
    plain:
      "从腰部进针到椎管，取少量脑脊液检查，也可在同一操作中注入化疗药。用来判断中枢神经系统是否受累。",
    detail:
      "腰穿在儿童白血病中既可能是检查，也可能是预防性治疗的一部分。操作前准备、体位、术后平卧时间和观察要求，按治疗医院的具体宣教执行。",
    caution: "腰穿后出现剧烈头痛、呕吐、发热或下肢异常，应及时联系治疗医院。",
    source: SOURCE.pathway,
  },
  {
    id: "cerebrospinal-fluid",
    entryId: "lumbar-puncture",
    term: "脑脊液检查",
    aka: ["脑脊液"],
    group: "检查与报告",
    plain:
      "检查包围脑和脊髓的液体，看细胞数量、分类以及是否存在白血病细胞，判断中枢神经系统有没有受累。",
    detail:
      "脑脊液报告还可能包含蛋白、糖等指标。单项异常不一定代表白血病侵犯，需结合腰穿过程和临床表现由医生判断。",
    source: SOURCE.pathway,
  },
  {
    id: "blood-count",
    entryId: "blood-count",
    term: "血常规",
    aka: ["血象", "血细胞分析"],
    group: "检查与报告",
    plain:
      "抽血计数白细胞、红细胞、血红蛋白和血小板等。化疗期间会频繁复查，用来观察造血恢复情况和是否需要支持治疗。",
    detail:
      "儿童不同年龄的参考范围不同，同一份报告在不同治疗阶段的意义也不同。家长可以记录数值变化，但不要自行据此停药、加药或判断复发。",
    caution: "本站不解读孩子的血常规报告。",
    source: SOURCE.pathway,
  },
  {
    id: "neutrophil",
    entryId: "blood-count",
    term: "中性粒细胞",
    aka: ["ANC", "中性粒细胞绝对值"],
    group: "检查与报告",
    plain:
      "白细胞的一种，是对抗细菌感染的主力。化疗后中性粒细胞可能明显下降，感染风险随之升高。",
    detail:
      "报告中的「中性粒细胞绝对值（ANC）」比百分比更常用于判断感染风险。具体警戒值和处置由治疗医院规定。",
    caution: "中性粒细胞低时出现发热，应按医院要求尽快就诊，不要在家观察等待。",
    source: SOURCE.pathway,
  },
  {
    id: "induction",
    entryId: "treatment-phases",
    term: "诱导缓解治疗",
    aka: ["诱导治疗", "诱导期"],
    group: "治疗与护理",
    plain:
      "初治的第一阶段，目标是尽可能清除白血病细胞、让正常造血恢复，争取达到完全缓解。",
    detail:
      "诱导期检查密集、住院时间可能较长。具体药物组合和天数按分型、危险度和所用方案执行，不同医院和方案并不相同。",
    caution: "本站不提供诱导方案、药物剂量或疗程天数。",
    source: SOURCE.pathway,
  },
  {
    id: "consolidation",
    entryId: "treatment-phases",
    term: "巩固治疗",
    aka: ["巩固期", "强化治疗"],
    group: "治疗与护理",
    plain:
      "达到缓解后继续进行的治疗阶段，目的是清除残留的白血病细胞、降低复发风险。",
    detail:
      "巩固阶段可能包含不同药物组合、腰穿和鞘内注射。强度和次数与危险度分层相关，按方案执行。",
    source: SOURCE.pathway,
  },
  {
    id: "maintenance",
    entryId: "treatment-phases",
    term: "维持治疗",
    aka: ["维持期"],
    group: "治疗与护理",
    plain:
      "后续较长阶段的治疗，常以口服药物和定期复查为主，部分方案包含间断的静脉用药。",
    detail:
      "维持期的时长和用药安排因分型、危险度和方案而异。本站不给出通用时长；家长应按治疗医院的时间表复诊，不自行停药或改量。",
    caution: "维持期仍需按时服药和复查，漏服或停药应先联系治疗医院。",
    source: SOURCE.pathway,
  },
  {
    id: "intrathecal",
    entryId: "lumbar-puncture",
    term: "鞘内注射",
    aka: ["鞘注", "腰穿打药"],
    group: "治疗与护理",
    plain:
      "通过腰穿把化疗药直接注入脑脊液，用来预防或治疗中枢神经系统白血病。",
    detail:
      "鞘内注射的药品、次数和间隔按治疗方案执行。操作前后需要配合体位和观察，具体以治疗医院要求为准。",
    caution: "本站不提供鞘内注射的药物、剂量或次数建议。",
    source: SOURCE.pathway,
  },
  {
    id: "central-line",
    entryId: "central-line",
    term: "PICC",
    aka: ["经外周静脉置入中心静脉导管"],
    group: "治疗与护理",
    plain:
      "从手臂静脉置入、尖端到达上腔静脉附近的细长导管，用来减少反复扎针和输注刺激性药物时的血管损伤。",
    detail:
      "置管后的固定、冲管、换药和洗澡注意事项由医院护士宣教。出现红肿、渗液、疼痛或发热时及时联系医院。",
    source: SOURCE.pathway,
  },
  {
    id: "port",
    entryId: "central-line",
    term: "输液港",
    aka: ["植入式静脉输液港", "港座"],
    group: "治疗与护理",
    plain:
      "完全埋在皮下的静脉通路，需要时用专用针穿过皮肤连接，适合需要长期输液的孩子。",
    detail:
      "输液港的维护周期和使用注意事项按医院要求执行。家长不要自行触碰港座或尝试连接。",
    source: SOURCE.pathway,
  },
  {
    id: "myelosuppression",
    entryId: "infection-fever",
    term: "骨髓抑制",
    aka: ["骨髓抑制期", "血象低"],
    group: "治疗与护理",
    plain:
      "化疗后骨髓造血暂时下降，表现为白细胞、血小板和血红蛋白降低，感染、出血和贫血的风险增加。",
    detail:
      "骨髓抑制的深浅和持续时间与药物、方案和个体差异有关。医院会安排血象监测和支持治疗，家长按医嘱复诊。",
    caution: "出现发热、出血点、牙龈出血或明显乏力，应及时联系治疗医院。",
    source: SOURCE.pathway,
  },
  {
    id: "febrile-neutropenia",
    entryId: "infection-fever",
    term: "发热性中性粒细胞减少",
    aka: ["粒缺伴发热", "FN"],
    group: "治疗与护理",
    plain:
      "中性粒细胞很低时出现发热，可能提示严重感染，需要尽快由治疗医院评估，不能按普通感冒在家处理。",
    detail:
      "化疗期间发热的原因不一定能马上查明，医生通常会先做检查并尽快开始处理。家长记录体温、时间和伴随症状，带上正在使用的药物清单。",
    caution: "这是需要立即联系治疗医院的情况，本站不提供退烧药或抗生素建议。",
    source: SOURCE.pathway,
  },
  {
    id: "transfusion",
    term: "成分输血",
    aka: ["输血", "输血小板", "输红细胞"],
    group: "治疗与护理",
    plain:
      "把血液中的某种成分（如红细胞或血小板）输给孩子，用来纠正贫血或降低出血风险。",
    detail:
      "是否需要输血由医生根据血象、症状和方案判断。输血前需要核对身份和血型，家长配合医院流程即可。",
    source: SOURCE.pathway,
  },
  {
    id: "gcsf",
    term: "粒细胞集落刺激因子",
    aka: ["G-CSF", "升白针"],
    group: "治疗与护理",
    plain:
      "一种促进中性粒细胞生成的药物，部分化疗方案后会使用，帮助血象恢复。",
    detail:
      "是否使用、何时使用和用多久由治疗医院按方案决定。家长不要自行购买或调整。",
    caution: "本站不提供升白针的使用时机或剂量建议。",
    source: SOURCE.pathway,
  },
  {
    id: "supportive-care",
    term: "支持治疗",
    aka: ["对症支持"],
    group: "治疗与护理",
    plain:
      "围绕抗感染、输血、止吐、营养和疼痛等进行的辅助治疗，目的是让孩子更安全地完成抗白血病治疗。",
    detail:
      "支持治疗是治疗方案的一部分，不是「放弃治疗」。具体措施由治疗团队根据当下情况决定。",
    source: SOURCE.pathway,
  },
  {
    id: "asparaginase",
    term: "门冬酰胺酶",
    aka: ["培门冬酶", "左旋门冬酰胺酶"],
    group: "用药",
    plain:
      "儿童 ALL 方案中常用的一类抗白血病药物，通过消耗白血病细胞需要的门冬酰胺起作用。",
    detail:
      "用药期间医院会观察过敏、胰腺和凝血等情况。不同剂型和方案的使用方式不同，家长不要自行补打或停药。",
    caution: "本站不提供门冬酰胺酶的剂量、用法或过敏处理建议。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "glucocorticoid",
    term: "糖皮质激素",
    aka: ["激素", "泼尼松", "地塞米松"],
    group: "用药",
    plain:
      "儿童 ALL 方案中常用的一类药物，属于抗白血病治疗的一部分，也用于某些支持治疗。",
    detail:
      "长期使用时需要按医嘱逐渐减量，不能自行突然停药。用药期间的情绪、血糖、血压和感染风险由医院监测。",
    caution: "本站不提供激素的剂量、疗程或减量方案。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "methotrexate",
    term: "甲氨蝶呤",
    aka: ["MTX"],
    group: "用药",
    plain:
      "一种抗代谢类化疗药，在儿童 ALL 方案中可用于鞘内注射或特定阶段的静脉治疗。",
    detail:
      "不同用法的监测重点不同，医院会按方案安排血药浓度、肝肾功能等检查。家长按医嘱配合，不自行调整。",
    caution: "本站不提供甲氨蝶呤的剂量或解救方案。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "mercaptopurine",
    term: "巯嘌呤",
    aka: ["6-MP", "6-巯基嘌呤"],
    group: "用药",
    plain:
      "儿童 ALL 维持期常用的口服抗白血病药物，通常需要按医嘱长期规律服用。",
    detail:
      "服药时间、剂量调整和血象监测由治疗医院安排。漏服后如何补服应先问医院，不要自行加倍。",
    caution: "本站不提供巯嘌呤的剂量调整建议。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "vincristine",
    term: "长春新碱",
    aka: ["VCR"],
    group: "用药",
    plain:
      "儿童白血病方案中常用的一种静脉化疗药，属于长春碱类药物。",
    detail:
      "输注时护士会密切观察是否外渗，用药后可能关注神经和肠道反应。具体表现和处理由治疗医院判断。",
    caution: "本站不提供长春新碱的剂量或外渗处理建议。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "anthracycline",
    term: "蒽环类药物",
    aka: ["柔红霉素", "多柔比星", "去甲氧柔红霉素"],
    group: "用药",
    plain:
      "一类常用的抗白血病化疗药，部分方案中会使用。累计用量与心脏影响相关，治疗期间通常需要做心脏超声等监测。",
    detail:
      "监测安排由治疗医院按方案执行。家长可以记录孩子做过的心脏检查，复诊时带上报告。",
    caution: "本站不提供蒽环类药物的选择、剂量或心脏保护方案。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "atra",
    term: "全反式维甲酸",
    aka: ["ATRA", "维甲酸"],
    group: "用药",
    plain:
      "APL 治疗中使用的分化诱导药物，帮助异常早幼粒细胞成熟。APL 的方案与一般 AML 不同。",
    detail:
      "用药期间医院会重点观察出血、发热和呼吸等情况。家长不要自行增减药量，出现异常及时联系治疗医院。",
    caution: "本站不提供 ATRA 的用法、剂量或不良反应处理建议。",
    source: SOURCE.nhcAllApl,
  },
  {
    id: "resident-insurance",
    entryId: "insurance-enrollment",
    term: "城乡居民基本医保",
    aka: ["居民医保", "少儿医保", "学生医保"],
    group: "费用与票据",
    plain:
      "儿童通常随家庭参加城乡居民基本医疗保险，按参保地规定缴费和享受待遇。具体参保时间、缴费标准和报销规则由当地确定。",
    detail:
      "参保地通常按户籍地或常住地确定。孩子跨省就医前，先确认参保地、备案要求和目标医院是否联网，避免把就医地当成待遇计算地。",
    source: SOURCE.triple,
  },
  {
    id: "critical-illness-insurance",
    entryId: "triple-security",
    term: "大病保险",
    aka: ["城乡居民大病保险"],
    group: "费用与票据",
    plain:
      "在基本医保之后，对参保居民高额合规医疗费用再进行支付的制度，多数地区随居民医保自动参保。",
    detail:
      "起付线、支付比例和年度上限由各统筹地区确定，本站不推算具体金额。结算单上通常会单列大病保险支付。",
    source: SOURCE.triple,
  },
  {
    id: "medical-assistance",
    entryId: "triple-security",
    term: "医疗救助",
    aka: ["医疗救助制度"],
    group: "费用与票据",
    plain:
      "对符合条件的困难群众，在基本医保和大病保险之后对个人负担进行托底保障的制度。",
    detail:
      "救助对象认定、申请材料和办理流程由当地民政、医保等部门规定。医院医保窗口通常可以说明本地申请入口。",
    caution: "是否符合条件由经办部门认定，本站不判断家庭资格。",
    source: SOURCE.triple,
  },
  {
    id: "deductible",
    entryId: "triple-security",
    term: "起付线",
    aka: ["起付标准"],
    group: "费用与票据",
    plain:
      "医保开始按比例支付前，个人需要先负担的额度。门诊、住院和大病保险的起付线可能分别设置。",
    detail:
      "起付线按参保地政策和就医类型确定，不同医院等级也可能不同。结算单上一般能看到本次是否达到起付标准。",
    source: SOURCE.triple,
  },
  {
    id: "cap",
    entryId: "triple-security",
    term: "封顶线",
    aka: ["最高支付限额"],
    group: "费用与票据",
    plain:
      "一个年度内医保基金最多支付的额度。超过封顶线的部分，按当地大病保险、医疗救助或商业保险等规定处理。",
    detail:
      "封顶线由参保地确定，不要把它和单次住院费用或发票金额混为一谈。",
    source: SOURCE.triple,
  },
  {
    id: "policy-range",
    entryId: "triple-security",
    term: "政策范围内费用",
    aka: ["合规费用", "目录内费用"],
    group: "费用与票据",
    plain:
      "符合医保药品、诊疗项目和医用耗材目录及支付规定的费用。它通常小于发票总额，因为目录外项目不计入。",
    detail:
      "结算单上常分别列出总费用、政策范围内费用和各类支付。看报销比例时，要先确认分母是哪一个。",
    source: SOURCE.triple,
  },
  {
    id: "pooled-payment",
    entryId: "triple-security",
    term: "统筹支付",
    aka: ["医保统筹", "基金支付"],
    group: "费用与票据",
    plain:
      "医保统筹基金按政策为本次费用支付的金额，通常在发票或结算单上单独列出。",
    detail:
      "统筹支付不等于全部报销金额。大病保险、医疗救助、个人账户和现金支付可能另列，不能只把统筹支付当成「报销了多少」。",
    source: SOURCE.receipt,
  },
  {
    id: "personal-account",
    entryId: "triple-security",
    term: "个人账户",
    aka: ["医保个人账户"],
    group: "费用与票据",
    plain:
      "职工医保参保人个人账户中的资金，可用于规定的医药费用。城乡居民医保通常不设个人账户，以当地政策为准。",
    detail:
      "家庭共济的适用范围和办理方式按参保地规定。票据上的「个人账户支付」是实际使用的账户金额，不是医保报销。",
    source: SOURCE.receipt,
  },
  {
    id: "personal-payment",
    entryId: "receipt-types",
    term: "个人自付与个人自费",
    aka: ["自付", "自费"],
    group: "费用与票据",
    plain:
      "「个人自付」一般指政策范围内按比例由个人负担的部分；「个人自费」一般指目录外或按规定完全由个人承担的费用。两者不是一回事。",
    detail:
      "不同票据和结算单的用词可能略有差异，以票面标签和经办解释为准。本站分别保留原标签，不把它们相加成「自付总额」。",
    source: SOURCE.receipt,
  },
  {
    id: "outpatient-special",
    entryId: "zhejiang-outpatient",
    term: "门诊特殊病种",
    aka: ["门诊慢特病", "特殊病种", "慢特病"],
    group: "费用与票据",
    plain:
      "医保对恶性肿瘤等需要长期门诊治疗的病种设置的专项待遇。经认定后，符合规定的门诊费用可按相应待遇结算。",
    detail:
      "浙江省相关文件将恶性肿瘤纳入门诊特殊病种范围。具体治疗方式、认定材料、定点医疗机构和异地结算安排，以参保地医保部门要求为准。",
    caution: "认定和待遇标准由参保地经办机构确定，本站不判断能否通过认定。",
    source: SOURCE.zjOutpatient,
  },
  {
    id: "remote-filing",
    entryId: "cross-province",
    term: "异地就医备案",
    aka: ["异地备案", "跨省备案"],
    group: "费用与票据",
    plain:
      "参保人到参保地以外就医时，按规定向参保地医保部门办理的登记。备案后符合条件的费用可以直接结算。",
    detail:
      "备案类型通常包括异地长期居住和临时外出就医等，具体名称、有效期和办理渠道按参保地规定。可以通过国家医保服务平台或参保地指定渠道核对。",
    caution: "是否需要先备案、备案后能结算哪些项目，以参保地经办机构和医院答复为准。",
    source: SOURCE.cross,
  },
  {
    id: "referral",
    entryId: "cross-province",
    term: "转诊",
    aka: ["转诊转院", "转诊证明"],
    group: "费用与票据",
    plain:
      "由参保地定点医疗机构根据病情出具意见，转到其他医院就医。部分地区是否转诊会影响报销比例或备案类型。",
    detail:
      "是否需要转诊、由哪家医院出具、有效期多久，按参保地规定。出发前先问清，避免影响结算。",
    source: SOURCE.crossGuide,
  },
  {
    id: "e-invoice",
    entryId: "receipt-verify",
    term: "医疗收费电子票据",
    aka: ["电子发票", "医疗电子票据"],
    group: "费用与票据",
    plain:
      "财政监制的医疗收费电子凭证，包含票据代码、票号、校验码、开票日期、项目金额等信息，可作为收费凭证使用。",
    detail:
      "电子票据可以下载保存，也可通过官方渠道查验。申请救助时通常需要的是收费票据原件或官方认可的电子件，具体以受理方要求为准。",
    caution: "本站不判断票据真伪；查验请使用官方票据查验渠道。",
    source: SOURCE.receipt,
  },
  {
    id: "invoice-number",
    entryId: "receipt-verify",
    term: "票据代码与票号",
    aka: ["票号", "发票号码", "票据号码"],
    group: "费用与票据",
    plain:
      "票据代码标识票据种类和地区，票号是这张票据的编号。两者一起核对，能发现同机构重复提交的票据。",
    detail:
      "本站把票号按字符串保存，避免前导零丢失。相同机构下完整票号一致时，会提示「疑似同一张票」，但是否重复仍由家长确认。",
    source: SOURCE.receipt,
  },
  {
    id: "check-code",
    entryId: "receipt-verify",
    term: "校验码",
    aka: ["票据校验码"],
    group: "费用与票据",
    plain:
      "电子票据上用于官方查验的代码，通常和票据代码、票号一起使用。",
    detail:
      "不同地区的查验入口可能不同，以票据上的提示和财政部门公布的平台为准。不要把校验码发给不明身份的个人或非官方代办。",
    source: SOURCE.receipt,
  },
  {
    id: "red-reversal",
    entryId: "duplicate-red",
    term: "红冲",
    aka: ["红字发票", "冲红"],
    group: "费用与票据",
    plain:
      "开票方发现票据开错或需要退费时，开具红字票据冲销原票据。红冲票和原票要放在一起看。",
    detail:
      "红冲不是一笔新的治疗费用。整理时保留两张票据并注明关系，避免把原票和红冲票各算一次。是否影响救助申报，按受理方要求确认。",
    caution: "本站不自动合并或删除红冲票据，由家长核对后处理。",
    source: SOURCE.receipt,
  },
  {
    id: "settlement-slip",
    entryId: "receipt-types",
    term: "医保结算单",
    aka: ["结算单", "医保结算凭证"],
    group: "费用与票据",
    plain:
      "医院或医保系统出具的本次就医结算明细，通常列总费用、统筹支付、大病保险、医疗救助、个人账户和现金支付等。",
    detail:
      "结算单是核对「谁支付了多少」的关键材料。不同地区格式不同，字段名称也可能不一样，以原件标签为准。",
    source: SOURCE.receipt,
  },
  {
    id: "fee-list",
    entryId: "receipt-types",
    term: "费用清单",
    aka: ["住院费用清单", "明细清单"],
    group: "费用与票据",
    plain:
      "逐项列出药品、检查、治疗和耗材的名称、数量、单价和金额，用来核对发票总额由哪些项目组成。",
    detail:
      "当发票只写「西药费」「检测费」时，费用清单能帮助确认具体项目。清单通常不显示医保支付，支付信息看结算单。",
    source: SOURCE.receipt,
  },
  {
    id: "drug-catalog",
    term: "医保药品目录",
    aka: ["医保目录", "甲乙类"],
    group: "费用与票据",
    plain:
      "国家和地方规定的基本医保药品范围。目录内药品分甲类、乙类等，目录外药品通常需要个人自费。",
    detail:
      "目录会更新，同一药品的支付限制也可能不同。具体某次用药是否在目录内、按什么比例支付，以参保地医保部门和结算单为准。",
    source: SOURCE.triple,
  },
  {
    id: "out-of-catalog",
    term: "目录外自费",
    aka: ["自费药", "目录外费用"],
    group: "费用与票据",
    plain:
      "不在医保药品、诊疗项目或耗材目录内，需要个人全额承担的费用。",
    detail:
      "景宁第五期「小鹿灯」公告明确的费用范围，是治疗所需的医保目录外自费药品，以及和治疗相关的基因检测等精准诊断费用。是否属于申报范围仍由项目方按公告审核。",
    caution: "本站不判断某笔费用能否获得救助。",
    source: SOURCE.jingning,
  },
] as const;

export const glossaryEntries: GlossaryEntry[] = glossaryEntriesSchema.parse(
  rawEntries.map((entry) => ({
    ...entry,
    ...entry.source,
    verifiedAt,
  })),
);

export const glossaryGroups = [
  "疾病与分型",
  "检查与报告",
  "治疗与护理",
  "用药",
  "费用与票据",
] as const;
