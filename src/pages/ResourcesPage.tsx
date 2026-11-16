import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  countByCategory,
  latestVerifiedAt,
  policyCategories,
  policyRegions,
  policyResources,
  resourceCategories,
} from "@/src/data/policies/resources";
import type { PolicyCategory, PolicyRegion } from "@/src/domain/schemas";
import { PageHeader } from "@/src/components/PageHeader";
import { PolicyCardView } from "@/src/components/PolicyCardView";
import { usePageTitle } from "@/src/lib/usePageTitle";

const ALL = "全部";

const provinces = [
  "北京",
  "天津",
  "河北",
  "山西",
  "内蒙古",
  "辽宁",
  "吉林",
  "黑龙江",
  "上海",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "广西",
  "海南",
  "重庆",
  "四川",
  "贵州",
  "云南",
  "西藏",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "新疆",
] as const;

function isRegion(value: string | null): value is PolicyRegion {
  return value !== null && (policyRegions as readonly string[]).includes(value);
}

function isCategory(value: string | null): value is PolicyCategory {
  return value !== null && (policyCategories as readonly string[]).includes(value);
}

export default function ResourcesPage() {
  usePageTitle("医保和救助资料");

  const [params, setParams] = useSearchParams();
  const regionParam = params.get("region");
  const categoryParam = params.get("category");
  const region: PolicyRegion | typeof ALL = isRegion(regionParam) ? regionParam : ALL;
  const category: PolicyCategory | typeof ALL = isCategory(categoryParam) ? categoryParam : ALL;

  const [insuredProvince, setInsuredProvince] = useState("浙江");
  const [treatedPlace, setTreatedPlace] = useState("本省医院");

  const activeResources = useMemo(
    () => policyResources.filter((resource) => !resource.isArchived),
    [],
  );

  const filtered = useMemo(
    () =>
      activeResources.filter((resource) => {
        if (region !== ALL && resource.region !== region) return false;
        if (category !== ALL && !resourceCategories(resource).includes(category)) return false;
        return true;
      }),
    [activeResources, region, category],
  );

  function updateParam(key: "region" | "category", value: string) {
    const next = new URLSearchParams(params);
    if (value === ALL) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  return (
    <>
      <PageHeader
        eyebrow="公开医保和救助资料"
        title="按参保地和事项查入口"
        lead="先确认家庭参保在哪里，再看办理入口。待遇认定按参保地政策，支付范围按就医地目录，不要把就医医院所在地直接当成计算待遇的地区。"
      />

      <div className="filter-panel">
        <div className="filter-panel__grid">
          <div className="field">
            <label className="field__label" htmlFor="insured-place">
              参保省份
            </label>
            <select
              id="insured-place"
              className="select"
              value={insuredProvince}
              onChange={(event) => setInsuredProvince(event.target.value)}
            >
              {provinces.map((province) => (
                <option key={province}>{province}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="treated-place">
              就医地
            </label>
            <select
              id="treated-place"
              className="select"
              value={treatedPlace}
              onChange={(event) => setTreatedPlace(event.target.value)}
            >
              <option>本省医院</option>
              <option>省外医院</option>
              <option>还不确定</option>
            </select>
            <span className="field__hint">示例默认：浙江参保、本省就医。</span>
          </div>
        </div>
        <p className="field__hint" style={{ marginTop: 12 }}>
          当前选择：参保地「{insuredProvince === "浙江" ? "浙江省丽水市景宁畲族自治县" : `中国大陆 ${insuredProvince}`}
          」，就医地「{treatedPlace}」。资料筛选只影响本页展示，不会改变家庭账本。
        </p>
      </div>

      <section className="coverage-panel" aria-labelledby="coverage-title">
        <div className="coverage-panel__head">
          <div>
            <h2 className="section__title" id="coverage-title">
              全国参保地目录
            </h2>
            <p className="section__note">
              本站收录国家统一制度，以及浙江、景宁两地的已核对资料。其余省区的地方细则还没有逐条核对，统一显示「待核对」，不生成推测比例或材料清单。
            </p>
          </div>
          <span className="coverage-panel__badge">31 个省级地区</span>
        </div>
        <div className="coverage-chips" role="group" aria-label="选择参保省份">
          {provinces.map((province) => (
            <button
              key={province}
              type="button"
              className="coverage-chip"
              aria-pressed={insuredProvince === province}
              onClick={() => setInsuredProvince(province)}
            >
              {province}
              <span aria-hidden="true">
                {province === "浙江" ? "已收录" : "待核对"}
              </span>
            </button>
          ))}
        </div>
        <p className="coverage-panel__note" role="status">
          <b>{insuredProvince}</b>
          {insuredProvince === "浙江"
            ? "：已收录浙江门诊特殊病种资料；景宁另有「小鹿灯」资料。具体待遇认定仍以参保地办理要求为准。"
            : "：地方起付线、支付比例、门诊慢特病认定材料和定点机构尚未收录，显示为「待核对」。请通过国家医保服务平台或 12393 向参保地医保部门确认。"}
        </p>
        <p className="field__hint">
          <a href="https://fuwu.nhsa.gov.cn/" target="_blank" rel="noreferrer noopener">
            国家医保服务平台
          </a>
          <span aria-hidden="true"> · </span>
          全国统一医保服务热线 12393
          <span aria-hidden="true"> · </span>
          参保地医保部门或医院医保窗口
        </p>
      </section>

      <div className="filter-panel">
        <div className="field">
          <span className="field__label" id="region-label">
            地区
          </span>
          <div className="chip-group" role="group" aria-labelledby="region-label">
            <button
              type="button"
              className="chip"
              aria-pressed={region === ALL}
              onClick={() => updateParam("region", ALL)}
            >
              全部
              <span className="chip__count">{activeResources.length}</span>
            </button>
            {policyRegions.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={region === item}
                onClick={() => updateParam("region", item)}
              >
                {item}
                <span className="chip__count">
                  {activeResources.filter((resource) => resource.region === item).length}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <span className="field__label" id="category-label">
            办理事项
          </span>
          <div className="chip-group" role="group" aria-labelledby="category-label">
            <button
              type="button"
              className="chip"
              aria-pressed={category === ALL}
              onClick={() => updateParam("category", ALL)}
            >
              全部
              <span className="chip__count">{activeResources.length}</span>
            </button>
            {policyCategories.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={category === item}
                onClick={() => updateParam("category", item)}
              >
                {item}
                <span className="chip__count">{countByCategory(activeResources, item)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="result-bar">
        <p className="result-bar__count" aria-live="polite">
          命中 {filtered.length} 条资料
        </p>
        <p className="result-bar__meta">
          收录 {activeResources.length} 条 · 最近核对 {latestVerifiedAt(activeResources)} · 历史资料默认不列入可办理结果
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <p className="card__body">
            这个筛选组合暂时没有收录。可切回「全部」，或向参保地医保部门、医院医保窗口确认。
          </p>
        </div>
      ) : (
        filtered.map((resource) => <PolicyCardView key={resource.id} resource={resource} />)
      )}

      <p className="notice">
        材料、比例和有效期只有来源明确时才展示。缺少当地细则的事项，请向参保地医保部门或医院医保窗口确认。
      </p>
    </>
  );
}
