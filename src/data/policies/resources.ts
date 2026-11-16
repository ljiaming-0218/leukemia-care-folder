import {
  policyResourcesSchema,
  type PolicyCategory,
  type PolicyResource,
} from "@/src/domain/schemas";

const NHSA_TRIPLE = "https://www.nhsa.gov.cn/art/2024/9/10/art_14_13819.html";
const ZJ_OUTPATIENT =
  "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3096/site/attach/0/e65965bb7279428e84c3f7066274f31d.pdf";
const NHSA_CROSS_PROVINCE = "https://www.nhsa.gov.cn/art/2022/7/26/art_104_8629.html";
const NHSA_2025_GUIDE = "https://www.nhsa.gov.cn/art/2025/6/7/art_14_16754.html";
const NHSA_OUTPATIENT_QA = "https://www.nhsa.gov.cn/art/2025/7/19/art_14_17329.html";
const NHSA_SERVICE = "https://fuwu.nhsa.gov.cn/";
const MOF_E_INVOICE =
  "https://www.mof.gov.cn/gkml/caizhengwengao/wg201901/wg201908/201912/t20191230_3452059.htm";
const CRCF = "https://www.crcf.org.cn/";
const CHARITY_CHINA = "https://cszg.mca.gov.cn/";
const XINHUA_XUANXUAN = "http://news.china.com.cn/2026-11/11/content_118770857.shtml";
const JINGNING_NOTICE =
  "https://finance.sina.com.cn/wm/2026-09-21/doc-inispyne8995961.shtml";

const verifiedAt = "2026-11-16";

const rawResources = [
  {
    id: "national-triple-security",
    region: "全国",
    category: "参保与结算",
    alsoCovers: ["医疗救助"],
    title: "居民基本医保、大病保险、医疗救助",
    summary:
      "基本医保按规定报销目录内费用；大病保险对个人负担的合规医疗费用再支付；医疗救助对符合条件的困难家庭托底。起付线、支付比例和年度上限由参保地规则确定。",
    details: [
      {
        heading: "三类支付不是三选一",
        paragraphs: [
          "基本医保先按参保地目录和结算规则支付；大病保险在基本医保结算后，对个人负担的合规费用再支付；医疗救助面向经认定的困难家庭，通常需要单独申请。三者可以叠加，但顺序、起付线和比例由参保地规定，不能用一个固定比例套算。",
        ],
      },
      {
        heading: "目录内和目录外要分开看",
        paragraphs: [
          "医保目录内的药品和诊疗项目按当地规则支付；目录外自费药、部分基因检测通常不进入基本医保。结算单上只列已经发生的支付，未列出的项目不要按比例自行推算。",
        ],
        bullets: [
          "先看费用清单里每一项的医保类别。",
          "再对照结算单上的统筹、大病、救助、个人账户和现金支付。",
          "对不上时向医院医保窗口或参保地经办机构核对。",
        ],
      },
      {
        heading: "每年问一次参保地待遇",
        paragraphs: [
          "起付线、封顶线、报销比例和大病保险起付线可能随年度调整，往年经验不能直接套用。可请医保窗口打印当前年度的参保待遇清单，或在国家医保服务平台查询参保地信息。",
        ],
      },
    ],
    applicability: "参加城乡居民基本医保或职工基本医保的家庭。困难家庭认定与救助标准按参保地规定。",
    issuer: "国家医疗保障局",
    sourceUrl: NHSA_TRIPLE,
    sourceNote: "国家医保局制度说明。",
    publishedAt: "2024-09-10",
    verifiedAt,
    entryText: "国家医保局制度说明；具体办理咨询参保地医保部门或医院医保窗口。",
    confirmQuestions: [
      "参保地大病保险的起付线和报销比例是多少？",
      "家庭是否符合医疗救助认定条件，应向哪个部门申请？",
    ],
  },
  {
    id: "national-resident-insurance",
    region: "全国",
    category: "参保与结算",
    title: "城乡居民基本医保：先确认在哪参保",
    summary:
      "城乡居民基本医保按参保地组织参保、缴费和待遇。孩子确诊后，先确认参保状态、参保地和当年度待遇，再谈能报多少。新生儿参保登记时限和待遇起始时间按参保地规定。",
    details: [
      {
        heading: "参保地不是就医地",
        paragraphs: [
          "户籍地、常住地、学校所在地的参保规则可能不同。不要因为孩子转到外地医院治疗，就把就医医院所在地当成参保地。待遇认定、起付线、支付比例和封顶线都按参保地规则执行。",
        ],
      },
      {
        heading: "先查参保状态和缴费年度",
        paragraphs: [
          "断缴、等待期、年度集中参保期和补缴规则会影响待遇。异地治疗前，可以在国家医保服务平台或参保地经办机构确认参保状态是否正常、当年度待遇是否已生效。",
        ],
        bullets: [
          "孩子当前在哪参保，参保状态是否正常。",
          "当年度是否已缴费，有没有等待期。",
          "新生儿参保登记和待遇追溯的时限。",
        ],
      },
      {
        heading: "每年重新核对一次待遇",
        paragraphs: [
          "起付线、封顶线和目录可能按年度调整，往年的报销经验不能直接套用。需要时请医院医保窗口打印当前年度的待遇说明，或向参保地经办机构确认。",
        ],
      },
    ],
    applicability: "参加城乡居民基本医保的家庭；参加职工基本医保的家庭按职工医保规则核对。",
    issuer: "国家医疗保障局",
    sourceUrl: NHSA_TRIPLE,
    extraLinks: [{ label: "国家医保服务平台", url: NHSA_SERVICE }],
    sourceNote: "国家医保局制度说明（2024 年）。",
    publishedAt: "2024-09-10",
    verifiedAt,
    entryText: "国家医保服务平台 App，或参保地医保经办机构、医院医保窗口。",
    confirmQuestions: [
      "孩子当前参保状态是否正常，当年度待遇是否已生效？",
      "新生儿参保登记和待遇起始时间如何规定？",
      "当年度起付线、封顶线和目录在哪里查？",
    ],
  },
  {
    id: "national-critical-illness",
    region: "全国",
    category: "参保与结算",
    title: "大病保险：基本医保结算后的再支付",
    summary:
      "大病保险在基本医保结算后，对个人负担的合规医疗费用再支付。起付线、分段支付比例和年度上限由参保地确定。多数地区随基本医保一并结算，是否需要单独申请以参保地为准。",
    details: [
      {
        heading: "它不是另外买的商业保险",
        paragraphs: [
          "城乡居民大病保险通常随居民基本医保参保，不需要家庭另行购买。具体筹资和待遇由参保地组织，别把商业保险、惠民保和大病保险混为一谈。",
        ],
      },
      {
        heading: "合规费用和目录外费用要分开",
        paragraphs: [
          "大病保险通常只对合规医疗费用再支付。目录外自费药、部分基因检测和其他自费项目是否纳入，要看参保地规则和结算单实际列示，不能按一个固定比例推算。",
        ],
      },
      {
        heading: "在结算单上找单独字段",
        paragraphs: [
          "医保结算单如果单列「大病保险支付」，按票面记录；没有列示就保持「未记录」，不要自行补算。对数字有疑问时，向医院医保窗口或参保地经办机构核对。",
        ],
      },
    ],
    applicability: "参加城乡居民基本医保的家庭；困难家庭还可叠加医疗救助。",
    issuer: "国家医疗保障局",
    sourceUrl: NHSA_TRIPLE,
    sourceNote: "国家医保局三重保障制度说明（2024 年）。",
    publishedAt: "2024-09-10",
    verifiedAt,
    entryText: "随基本医保结算；具体规则咨询参保地医保部门。",
    confirmQuestions: [
      "本地大病保险是自动结算还是需要单独申请？",
      "起付线、分段比例和年度上限是多少？",
      "目录外自费药和基因检测是否纳入合规费用？",
    ],
  },
  {
    id: "national-medical-assistance",
    region: "全国",
    category: "医疗救助",
    alsoCovers: ["参保与结算"],
    title: "医疗救助：先认定，再申请",
    summary:
      "医疗救助面向经认定的困难家庭，通常需要单独申请。救助对象类别、起付线、支付比例和限额按参保地规定。它可以和基本医保、大病保险叠加，但不是自动发放。",
    details: [
      {
        heading: "先弄清家庭属于哪类救助对象",
        paragraphs: [
          "特困人员、低保对象、低保边缘家庭、因病致贫重病患者等类别，认定部门和条件可能不同。先向乡镇（街道）、民政部门或医保经办机构问清本地分类，再准备材料。",
        ],
      },
      {
        heading: "常见材料和办理顺序",
        paragraphs: [
          "通常需要身份材料、困难认定材料、诊断证明、医疗费用票据和医保结算单。是否需要先完成基本医保和大病保险结算，按当地要求办理。具体清单以受理部门当前说明为准。",
        ],
        bullets: [
          "先完成困难身份认定，再提交医疗救助申请。",
          "票据、费用清单和结算单保留原件。",
          "问清受理窗口、办理时限和结果查询方式。",
        ],
      },
      {
        heading: "制度救助和慈善项目分开记",
        paragraphs: [
          "医疗救助是制度性安排；小天使基金、公益平台等属于另一类项目，申请条件和材料不同。两类资金到账后分开记录，不要互相抵扣或重复计算。",
        ],
      },
    ],
    applicability: "经参保地认定的困难家庭；具体对象类别和标准按当地规定。",
    issuer: "国家医疗保障局（制度说明）；具体认定与受理按参保地规定",
    sourceUrl: NHSA_TRIPLE,
    sourceNote: "国家医保局三重保障制度说明（2024 年）。",
    publishedAt: "2024-09-10",
    verifiedAt,
    entryText: "向参保地乡镇（街道）、民政部门或医保经办机构咨询受理窗口。",
    confirmQuestions: [
      "家庭符合哪一类医疗救助对象，由哪个部门认定？",
      "是否需要先完成基本医保和大病保险结算？",
      "本地材料清单、办理时限和结果查询方式是什么？",
    ],
  },
  {
    id: "national-outpatient-chronic",
    region: "全国",
    category: "门诊特殊病种",
    title: "门诊慢特病跨省直接结算",
    summary:
      "恶性肿瘤门诊放化疗属于国家层面已纳入跨省直接结算的门诊慢特病病种之一；国家医保局公开资料显示病种范围已扩大到 10 种。参保人仍需在参保地完成待遇认定，并确认就医医院已开通该病种结算。",
    details: [
      {
        heading: "先认定，再谈直接结算",
        paragraphs: [
          "门诊慢特病待遇按参保地规定认定。没有完成认定的，不能仅凭异地就医备案就享受相应待遇。认定所需病历、诊断证明和检查材料，向参保地经办机构确认。",
        ],
      },
      {
        heading: "医院开通情况要单独核对",
        paragraphs: [
          "不是所有医院都开通所有病种。就医前向目标医院医保窗口确认：该院是否开通恶性肿瘤门诊放化疗的跨省直接结算，参保地是否在开通范围。",
        ],
      },
      {
        heading: "不能直接结算时保留全套材料",
        paragraphs: [
          "直接结算失败时，保留发票、费用清单、处方和病历，按参保地手工报销要求办理。不要因为一次结算失败就丢弃原件。",
        ],
        bullets: [
          "确认病种名称与参保地认定名称一致。",
          "确认就医医院已开通对应病种的跨省结算。",
          "保留直接结算失败的原因提示或截图。",
        ],
      },
    ],
    applicability: "已在参保地完成门诊慢特病待遇认定、需要跨省门诊治疗的家庭。",
    issuer: "国家医疗保障局",
    sourceUrl: NHSA_OUTPATIENT_QA,
    extraLinks: [
      { label: "跨省异地就医直接结算通知", url: NHSA_CROSS_PROVINCE },
      { label: "国家医保服务平台", url: NHSA_SERVICE },
    ],
    sourceNote: "国家医保局门诊慢特病跨省结算办事问答（2025 年）；病种名单以官方最新公布为准。",
    publishedAt: "2025-07-19",
    verifiedAt,
    entryText: "国家医保服务平台查询，或向参保地经办机构、就医医院医保窗口确认。",
    confirmQuestions: [
      "参保地是否已将恶性肿瘤门诊放化疗认定为门诊慢特病？",
      "就医医院是否开通该病种的跨省直接结算？",
      "不能直接结算时，回参保地手工报销需要哪些材料？",
    ],
  },
  {
    id: "national-e-invoice",
    region: "全国",
    category: "参保与结算",
    title: "医疗收费电子票据怎么读",
    summary:
      "医疗收费电子票据、费用清单和医保结算单是三份不同文件：发票证明收费，清单列项目，结算单列医保支付。保存原始电子文件；截图、旋转和 OCR 只作副本。",
    details: [
      {
        heading: "三份文件各回答一个问题",
        paragraphs: [
          "发票回答「收了多少钱、票号是什么」；费用清单回答「钱花在哪些项目上」；医保结算单回答「医保支付了多少、个人支付了多少」。同一次住院的三份文件应归在同一笔账目里。",
        ],
      },
      {
        heading: "票号、日期和金额分别核对",
        paragraphs: [
          "票号按字符串保存，注意完整位数和可能的前导零。费用发生日期和开票日期分开记录；日期不一致时，以实际诊疗、购药或检测发生日期核对专项窗口。",
        ],
      },
      {
        heading: "红冲、退费和重复上传",
        paragraphs: [
          "红冲或退费票据要保留，并和原票据放在一起核对。相同票号可能意味着重复上传；是否同一张票由家长对照原件确认，系统不自动合并或删除。",
        ],
      },
      {
        heading: "原件不发给外部识别服务",
        paragraphs: [
          "需要查验票据时，通过医院官方渠道或财政部票据查验入口操作。本站的识别和整理都在当前浏览器内完成，不把票据上传到第三方 OCR 服务。",
        ],
      },
    ],
    applicability: "所有需要保存医疗费用凭证、准备报销或救助申请的家庭。",
    issuer: "财政部、国家卫生健康委、国家医疗保障局",
    sourceUrl: MOF_E_INVOICE,
    sourceNote: "财政部等三部门医疗收费电子票据通知（2019 年发布）。",
    verifiedAt,
    entryText: "通过就诊医院的官方渠道下载或查验电子票据。",
    confirmQuestions: [
      "这张电子票据的原始文件在哪里下载？",
      "费用发生日期和开票日期分别是哪一天？",
      "红冲或退费后，原票据和冲红票据如何对应？",
    ],
  },
  {
    id: "national-xiaotianshi",
    region: "全国",
    category: "公益项目",
    title: "中国红十字基金会小天使基金",
    summary:
      "小天使基金面向白血病患儿开展救助，包括中央专项彩票公益金大病儿童救助项目和人道关怀金项目。具体病种、年龄、家庭条件、资助标准和材料，以基金会及当地红十字会当前说明为准。",
    details: [
      {
        heading: "两个项目不是一回事",
        paragraphs: [
          "中央专项彩票公益金大病儿童救助项目和人道关怀金项目的资金来源、资助对象和金额不同。2026 年 11 月新华社报道中，一名患儿先后获得 3 万元和 5000 元两笔资助；报道只作示例，不代表所有家庭都能获得相同金额。",
        ],
      },
      {
        heading: "通过官方渠道申请",
        paragraphs: [
          "申请通常由当地红十字会或基金会指定渠道受理。不要向个人支付「代办费」「包装费」，也不要把孩子的证件、病历和票据发给不明身份的个人。",
        ],
      },
      {
        heading: "材料按项目清单准备",
        paragraphs: [
          "常见材料包括诊断证明、病历、医疗费用票据和家庭情况说明，具体清单以项目当前要求为准。票据和诊断材料属于敏感资料，只在官方渠道要求的范围内提交。",
        ],
      },
    ],
    applicability: "符合项目当前条件的白血病患儿家庭；具体条件以基金会和当地红十字会说明为准。",
    issuer: "中国红十字基金会",
    sourceUrl: CRCF,
    extraLinks: [{ label: "新华社 2026-11-11 项目探访报道", url: XINHUA_XUANXUAN }],
    sourceNote: "中国红十字基金会官网；项目条件与受理状态以官方当前页面为准。",
    verifiedAt,
    entryText: "中国红十字基金会官网，或咨询当地红十字会。",
    confirmQuestions: [
      "当前哪个项目开放申请，资助对象和金额是多少？",
      "是否必须通过当地红十字会提交，材料清单是什么？",
      "申请进度和结果在哪里查询？",
    ],
  },
  {
    id: "national-charity-china",
    region: "全国",
    category: "公益项目",
    title: "慈善中国：核对公开募捐资格",
    summary:
      "慈善中国是民政部慈善信息平台，可查询慈善组织公开募捐资格和募捐方案备案。个人求助平台与公开募捐适用规则不同；本站不收款、不代发、不审核筹款项目。",
    details: [
      {
        heading: "公开募捐需要资格",
        paragraphs: [
          "面向社会公众开展公开募捐，应由具有公开募捐资格的慈善组织发起，并依法备案募捐方案。个人不能自行开展公开募捐。个人求助平台上的求助信息，按平台规则审核，不等同于公开募捐。",
        ],
      },
      {
        heading: "发布前查三件事",
        paragraphs: [
          "查组织名称是否与页面一致；查是否具有公开募捐资格；查募捐方案是否备案。只凭海报、群聊二维码或“保证筹到”的说法就转账，风险很高。",
        ],
        bullets: [
          "发起主体是慈善组织还是个人求助平台。",
          "组织是否具有公开募捐资格。",
          "募捐方案是否备案，起止时间和剩余款项如何处理。",
        ],
      },
      {
        heading: "本站只做整理和提醒",
        paragraphs: [
          "本站没有捐款按钮、收款码或患者账户，也不代写、代发或审核筹款项目。筹款说明草稿只在本机生成，是否发布、如何审核由平台决定。",
        ],
      },
    ],
    applicability: "准备发起筹款、或准备向公开募捐项目捐款的家庭和社会公众。",
    issuer: "民政部",
    sourceUrl: CHARITY_CHINA,
    sourceNote: "民政部慈善中国平台。",
    verifiedAt,
    entryText: "慈善中国官网查询慈善组织和募捐方案备案信息。",
    confirmQuestions: [
      "发起主体是否具有公开募捐资格？",
      "募捐方案是否备案，起止时间是什么？",
      "个人求助平台的审核状态和资金去向如何查询？",
    ],
  },
  {
    id: "zhejiang-outpatient-special",
    region: "浙江",
    category: "门诊特殊病种",
    title: "浙江门诊特殊病种（恶性肿瘤）",
    summary:
      "浙江省相关文件将恶性肿瘤纳入门诊特殊病种范围。具体覆盖的治疗方式、待遇认定、定点机构和所需材料，以参保地办理要求为准。",
    details: [
      {
        heading: "门诊特殊病种解决什么问题",
        paragraphs: [
          "把恶性肿瘤等需要长期门诊治疗的费用，按更接近住院的待遇结算，减少为报销反复住院。具体覆盖哪些治疗、检查和药品，要看参保地公布的病种范围和目录，不是所有门诊费用都自动纳入。",
        ],
      },
      {
        heading: "待遇认定是前提",
        paragraphs: [
          "通常需要指定医院出具诊断证明、病历和检查材料，再向参保地医保经办机构申请「门诊慢特病病种待遇认定」。认定通过后才按规定结算；认定前已发生的门诊费用是否追溯，由当地规则决定。",
        ],
        bullets: [
          "确认参保地使用的病种名称与医院诊断一致。",
          "问清认定医院范围、有效期和复审要求。",
          "保存认定结果，异地就诊时可能需要出示。",
        ],
      },
      {
        heading: "异地门诊要单独核对",
        paragraphs: [
          "办了异地就医备案，不等于门诊慢特病一定能在就医地直接结算。还要确认目标医院是否开通该病种的跨省或省内直接结算；未开通时保留发票、费用清单和处方，回参保地按手工报销要求办理。",
        ],
      },
    ],
    applicability: "浙江省参保、经认定符合门诊特殊病种条件的患者。",
    issuer: "浙江省医疗保障局",
    sourceUrl: ZJ_OUTPATIENT,
    sourceNote: "浙医保发〔2023〕39 号文件。",
    verifiedAt,
    entryText: "前往浙江政务服务网或「浙里办」核对「门诊慢特病病种待遇认定」。",
    confirmQuestions: [
      "参保地是否已开通该病种的门诊慢特病待遇认定？",
      "认定后在本市和异地分别怎么结算，需要先备案吗？",
      "需要提交哪些病历和检查材料？",
    ],
  },
  {
    id: "cross-province-settlement",
    region: "全国",
    category: "参保与结算",
    title: "跨省异地就医直接结算",
    summary:
      "跨省就医前核对三件事：异地就医备案、门诊慢特病待遇认定、目标医院是否开通相应跨省结算。执行口径为「参保地待遇、就医地支付范围」。",
    details: [
      {
        heading: "备案类型决定适用情形",
        paragraphs: [
          "异地长期居住、异地转诊转院、临时外出就医等备案类型，对应的有效期、起付线和报销比例可能不同。选错类型可能影响待遇，办理前先看参保地公布的备案类型说明，不确定时向经办机构确认。",
        ],
      },
      {
        heading: "直接结算失败先查五件事",
        paragraphs: [
          "结算失败时不要丢弃发票、费用明细和结算单，先联系参保地经办机构，按要求补办或回参保地手工报销。",
        ],
        bullets: [
          "是否已完成备案，备案是否在有效期内。",
          "参保状态是否正常，是否存在欠费。",
          "就医医院是否开通跨省联网结算。",
          "门诊慢特病病种是否已在参保地认定，并在就医地开通。",
          "社保卡或医保电子凭证是否可用。",
        ],
      },
      {
        heading: "待遇地和就医地各管一段",
        paragraphs: [
          "起付线、支付比例和封顶线按参保地规则；药品、诊疗项目是否在支付范围内按就医地目录。最终自付金额由两套规则共同决定，不能用就医医院的收费比例直接推断参保地能报多少。",
        ],
      },
    ],
    applicability: "参保地与就医地不同的家庭，包括长期居住和转诊转院情形。",
    issuer: "国家医疗保障局",
    sourceUrl: NHSA_CROSS_PROVINCE,
    extraLinks: [
      { label: "2025 年跨省异地就医经办说明", url: NHSA_2025_GUIDE },
      { label: "门诊慢特病跨省结算办事问答", url: NHSA_OUTPATIENT_QA },
    ],
    sourceNote: "2022 年跨省异地就医直接结算通知。",
    publishedAt: "2022-07-26",
    verifiedAt,
    entryText: "国家医保服务平台 App，或咨询参保地经办机构。",
    confirmQuestions: [
      "备案类型和有效期是什么，就医前还是就医后办理？",
      "门诊慢特病在就医地医院能否直接结算？",
      "不能直接结算时，回参保地报销要带哪些材料？",
    ],
  },
  {
    id: "jingning-xiaoludeng-phase5",
    region: "景宁",
    category: "公益项目",
    title: "景宁第五期「小鹿灯—愈见未来」",
    summary:
      "浙江省青少年发展基金会联合阿里巴巴公益基金会及阿里健康公益发起，面向公告范围内家庭经济相对困难的 0 至 18 周岁（含）白血病少年儿童。公告明确的费用为治疗所需的医保目录外自费药品，以及和治疗相关的基因检测等精准诊断费用。费用发生时间 2026-04-01 至 2026-12-31，申报「2027 年 1 月 15 日前」。",
    details: [
      {
        heading: "公告明确的费用范围",
        paragraphs: [
          "公告写的是治疗所需的医保目录外自费药品，以及和治疗相关的基因检测等精准诊断费用。已由基本医保、大病保险等支付的部分，以及非治疗必需项目，不在公告明示范围内。是否符合条件由项目方审核。",
        ],
      },
      {
        heading: "时间按费用发生日期核对",
        paragraphs: [
          "公告提示的费用发生时间范围是 2026-04-01 至 2026-12-31，指的是费用实际发生日期，不是开票日期或提交日期。票据日期与购药、检测日期不一致时，先向项目方确认以哪个日期为准，再判断是否在范围内。",
        ],
      },
      {
        heading: "申请前把票据和明细配齐",
        paragraphs: [
          "本站只做提醒和整理，不判断是否通过审核。最终附件格式、份数和提交方式以支付宝官方页面为准。",
        ],
        bullets: [
          "外购药：收费票据，尽量附处方或购药明细。",
          "基因检测：检测收费票据和项目明细。",
          "票面只写「西药费」「检测费」时，更需要能说明具体项目的材料。",
        ],
      },
    ],
    applicability:
      "公告规定范围内家庭经济相对困难的 0 至 18 周岁（含）白血病少年儿童，含符合当地居住条件的非本地户籍儿童。",
    issuer: "景宁县青少年事务发展中心（消息经景宁融媒刊发）",
    sourceUrl: JINGNING_NOTICE,
    sourceNote: "第五期申领公告，消息来自景宁县青少年事务发展中心。",
    publishedAt: "2026-09-21",
    verifiedAt,
    entryText: "支付宝搜索「小鹿灯儿童重疾救助平台」，按官方页面提示提交。",
    confirmQuestions: [
      "申报截止的具体时刻是什么？",
      "附件格式和材料清单以支付宝页面为准吗？",
      "费用发生日期以发票日期还是实际购药日期为准？",
    ],
  },
];

export const policyResources: PolicyResource[] = policyResourcesSchema.parse(rawResources);

export const policyRegions = ["全国", "浙江", "景宁"] as const;
export const policyCategories = [
  "参保与结算",
  "门诊特殊病种",
  "医疗救助",
  "公益项目",
] as const;

export function resourceCategories(resource: PolicyResource): PolicyCategory[] {
  return [resource.category, ...resource.alsoCovers];
}

export function countByCategory(
  resources: PolicyResource[],
  category: PolicyCategory,
): number {
  return resources.filter((resource) => resourceCategories(resource).includes(category)).length;
}

export function latestVerifiedAt(resources: PolicyResource[]): string | undefined {
  return resources
    .map((resource) => resource.verifiedAt)
    .sort()
    .at(-1);
}
