import type { ArchiveType } from "./documents";

export const routeStoreKey = "real:route";

export const treatedPlaces = ["本省医院", "省外医院", "还不确定"] as const;
export type TreatedPlace = (typeof treatedPlaces)[number];

export const routeStepStates = ["未办", "已办", "不适用"] as const;
export type RouteStepState = (typeof routeStepStates)[number];

export type InsuredPlace = {
  province: string;
  city: string;
  county: string;
};

export type RouteLink = { label: string; to: string };

export type RouteStep = {
  id: string;
  title: string;
  why: string;
  resourceIds: string[];
  localNote: { kind: "recorded" | "pending"; text: string };
  materials: string[];
  receiptTypes: ArchiveType[];
  links: RouteLink[];
  conditional?: string;
};

const JINGNING = "景宁畲族自治县";

export function buildRoute(place: InsuredPlace, treated: TreatedPlace): RouteStep[] {
  const isZhejiang = place.province === "浙江省";
  const isJingning = isZhejiang && place.county === JINGNING;
  const pendingLocal = {
    kind: "pending" as const,
    text: "待核对：该参保地的本地细则本站尚未收录，请向参保地医保部门、12393 或医院医保窗口确认。",
  };

  const steps: RouteStep[] = [
    {
      id: "insured-status",
      title: "确认孩子在哪参保、当年度待遇是否生效",
      why: "待遇按参保地规则执行，不按就医医院所在地。断缴、等待期会影响后面每一步。",
      resourceIds: ["national-resident-insurance"],
      localNote: pendingLocal,
      materials: ["孩子的医保电子凭证或社保卡", "当年度参保缴费记录"],
      receiptTypes: [],
      links: [],
    },
    {
      id: "outpatient-chronic",
      title: "申请门诊慢特病（门诊特殊病种）待遇认定",
      why: "长期门诊化疗、复查的费用，通常要先完成认定才能按相应待遇结算。",
      resourceIds: isZhejiang
        ? ["national-outpatient-chronic", "zhejiang-outpatient-special"]
        : ["national-outpatient-chronic"],
      localNote: isZhejiang
        ? {
            kind: "recorded",
            text: "已收录浙江门诊特殊病种文件；认定医院、材料和有效期仍以参保地办理要求为准。",
          }
        : pendingLocal,
      materials: ["诊断证明", "病历", "相关检查报告"],
      receiptTypes: ["病历或处方", "其他证明材料"],
      links: [],
    },
  ];

  if (treated !== "本省医院") {
    steps.push({
      id: "cross-province",
      title: "去省外治疗前办理异地就医备案",
      why: "未备案或备案类型不对，可能无法直接结算；参保地待遇、就医地支付范围。",
      resourceIds: ["cross-province-settlement"],
      localNote: {
        kind: "recorded",
        text: "国家统一经办口径已收录；备案类型、有效期和比例以参保地公布为准。",
      },
      materials: ["备案凭证或备案成功截图", "目标医院是否开通相应跨省结算的确认结果"],
      receiptTypes: [],
      links: [],
      conditional: treated === "还不确定" ? "确定去省外治疗时再办；本省就医可标「不适用」。" : undefined,
    });
  }

  steps.push(
    {
      id: "settlement",
      title: "每次住院、门诊做基本医保和大病保险结算",
      why: "大病保险在基本医保结算后再支付；结算单上的各项支付是后面申请救助的依据。",
      resourceIds: ["national-triple-security", "national-critical-illness", "national-e-invoice"],
      localNote: pendingLocal,
      materials: ["医院发票", "费用清单", "医保结算单"],
      receiptTypes: ["住院发票", "门诊发票", "费用清单", "医保结算单"],
      links: [
        { label: "导入并核对票据", to: "/receipts" },
        { label: "把同一次就诊归成一笔账", to: "/ledger" },
      ],
    },
    {
      id: "medical-assistance",
      title: "困难家庭申请医疗救助",
      why: "医疗救助需要先认定困难身份，再单独申请，不会自动发放。",
      resourceIds: ["national-medical-assistance"],
      localNote: pendingLocal,
      materials: ["困难身份认定材料", "诊断证明", "医疗费用票据", "医保结算单"],
      receiptTypes: ["住院发票", "门诊发票", "医保结算单"],
      links: [{ label: "查看费用说明", to: "/ledger#cost-statement" }],
    },
    {
      id: "charity",
      title: "申请公益救助项目",
      why: "公益项目和制度救助是两类钱，条件、材料和受理方各不相同，到账后分开记。",
      resourceIds: isJingning
        ? ["national-xiaotianshi", "jingning-xiaoludeng-phase5"]
        : ["national-xiaotianshi"],
      localNote: isJingning
        ? {
            kind: "recorded",
            text: "已收录景宁第五期「小鹿灯」；截止时刻和受理状态以项目方为准。",
          }
        : {
            kind: "pending",
            text: "待核对：本地公益项目本站尚未收录，可咨询当地红十字会或治疗医院的医务社工。",
          },
      materials: ["诊断证明", "项目要求的费用票据和明细", "家庭情况说明"],
      receiptTypes: ["外购药票据", "基因检测票据", "费用清单"],
      links: isJingning ? [{ label: "小鹿灯材料逐项核对", to: "/prepare?rule=jingning-xiaoludeng-phase5-2026" }] : [],
    },
    {
      id: "fundraising",
      title: "仍有缺口时，再考虑个人求助或公开募捐",
      why: "先核对发起主体资格，费用说明只写票据上有的数字。本站不收款、不代发。",
      resourceIds: ["national-charity-china"],
      localNote: {
        kind: "recorded",
        text: "公开募捐资格查询入口已收录；个人求助平台按平台规则审核。",
      },
      materials: ["费用说明（来自已确认账目）", "诊断证明"],
      receiptTypes: [],
      links: [{ label: "打开筹款准备", to: "/fundraising" }],
    },
  );

  return steps;
}

export function resourceLink(place: InsuredPlace, resourceId: string): string {
  const params = new URLSearchParams();
  if (place.province) params.set("province", place.province);
  if (place.city) params.set("city", place.city);
  if (place.county) params.set("county", place.county);
  return `/resources?${params.toString()}#${resourceId}`;
}

export function routeProgress(
  steps: RouteStep[],
  states: Record<string, RouteStepState>,
): { done: number; applicable: number } {
  const applicable = steps.filter((step) => states[step.id] !== "不适用");
  return {
    done: applicable.filter((step) => states[step.id] === "已办").length,
    applicable: applicable.length,
  };
}
