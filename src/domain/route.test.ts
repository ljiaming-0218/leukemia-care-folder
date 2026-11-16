import { describe, expect, it } from "vitest";
import { policyResources } from "@/src/data/policies/resources";
import { buildRoute, placePolicyRegions, routeProgress } from "./route";

const henan = { province: "河南省", city: "郑州市", county: "" };
const jingning = { province: "浙江省", city: "丽水市", county: "景宁畲族自治县" };

describe("buildRoute", () => {
  it("本省就医不出现异地备案，省外和不确定时出现", () => {
    const ids = (treated: "本省医院" | "省外医院" | "还不确定") =>
      buildRoute(henan, treated).map((step) => step.id);
    expect(ids("本省医院")).not.toContain("cross-province");
    expect(ids("省外医院")).toContain("cross-province");
    expect(ids("还不确定")).toContain("cross-province");
  });

  it("未收录地区的本地细则标为待核对，不套用浙江或景宁资料", () => {
    const steps = buildRoute(henan, "本省医院");
    const allIds = steps.flatMap((step) => step.resourceIds);
    expect(allIds).not.toContain("zhejiang-outpatient-special");
    expect(allIds).not.toContain("jingning-xiaoludeng-phase5");
    expect(steps.find((step) => step.id === "charity")?.localNote.kind).toBe("pending");
  });

  it("景宁参保地列出浙江门诊特殊病种和小鹿灯", () => {
    const allIds = buildRoute(jingning, "本省医院").flatMap((step) => step.resourceIds);
    expect(allIds).toContain("zhejiang-outpatient-special");
    expect(allIds).toContain("jingning-xiaoludeng-phase5");
  });

  it("每个步骤引用的资料卡都真实存在", () => {
    const known = new Set(policyResources.map((resource) => resource.id));
    for (const place of [henan, jingning]) {
      for (const step of buildRoute(place, "省外医院")) {
        step.resourceIds.forEach((id) => expect(known.has(id)).toBe(true));
      }
    }
  });
});

describe("routeProgress", () => {
  it("不适用的步骤不计入总数", () => {
    const steps = buildRoute(henan, "省外医院");
    const result = routeProgress(steps, {
      "insured-status": "已办",
      "cross-province": "不适用",
    });
    expect(result).toEqual({ done: 1, applicable: steps.length - 1 });
  });
});

describe("placePolicyRegions", () => {
  it("选到城市才有匹配范围，景宁才包含景宁资料", () => {
    expect(placePolicyRegions({ province: "浙江省", city: "", county: "" })).toBeNull();
    expect([...(placePolicyRegions(henan) ?? [])]).toEqual(["全国"]);
    expect([...(placePolicyRegions({ ...jingning, county: "" }) ?? [])]).toEqual(["全国", "浙江"]);
    expect([...(placePolicyRegions(jingning) ?? [])]).toEqual(["全国", "浙江", "景宁"]);
  });
});
