import { aidRuleSchema, type AidRule } from "@/src/domain/schemas";

const JINGNING_NOTICE =
  "https://finance.sina.com.cn/wm/2026-09-21/doc-inispyne8995961.shtml";

export const xiaoludengRule: AidRule = aidRuleSchema.parse({
  id: "jingning-xiaoludeng-phase5-2026",
  version: "2026.09.21",
  title: "景宁第五期「小鹿灯—愈见未来」",
  shortName: "小鹿灯第五期",
  region: "浙江 · 景宁畲族自治县",
  scopeText:
    "公告规定范围内家庭经济相对困难的 0 至 18 周岁（含）白血病少年儿童，含符合当地居住条件的非本地户籍儿童。是否符合由项目方审核。",
  resourceId: "jingning-xiaoludeng-phase5",
  eligibleCategories: ["外购药", "基因检测"],
  expenseFrom: "2026-04-01",
  expenseTo: "2026-12-31",
  deadlineText: "2027 年 1 月 15 日前",
  sourceUrl: JINGNING_NOTICE,
  publishedAt: "2026-09-21",
  verifiedAt: "2026-11-16",
  officialEntryText:
    "在支付宝搜索「小鹿灯儿童重疾救助平台」，按官方页面实际要求填写和上传附件。",
  hotline: "0571-87027471",
  hotlineNote: "浙江省青少年发展基金会热线，以公告为准",
  materialItems: [
    {
      id: "m-applied-receipts",
      label: "拟申报的外购药或基因检测收费票据",
      basis: "公告写明",
      note: "逐张核对原件、项目名称、费用发生日期、票号和可能重复。",
    },
    {
      id: "m-diagnosis",
      label: "诊断证明、出院小结或官方指定的病历材料",
      basis: "请在官方入口确认",
      note: "先看支付宝页面认可哪种证明，再准备对应原件。",
    },
    {
      id: "m-detail",
      label: "外购药处方或购药明细、基因检测项目明细",
      basis: "请在官方入口确认",
      note: "票面只写「西药费」「检测费」时，先核对明细，确认具体项目。",
    },
    {
      id: "m-identity",
      label: "身份证明、监护关系、困难证明及可能涉及的居住证明",
      basis: "请在官方入口确认",
      note: "只做提醒和勾选，不在网页录入证件号码或上传证件照片。",
    },
    {
      id: "m-reimbursement",
      label: "医保结算凭证或其他已获得的报销、资助记录",
      basis: "请在官方入口确认",
      note: "根据家庭实际情况准备，是否提交以官方入口要求为准。",
    },
  ],
});
