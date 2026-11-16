import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  countByCategory,
  latestVerifiedAt,
  policyCategories,
  policyRegions,
  policyResources,
  resourceCategories,
} from "@/src/data/policies/resources";
import {
  regionDataSource,
  regionDataVersion,
  regionProvinces,
} from "@/src/data/regions";
import type { PolicyCategory, PolicyRegion } from "@/src/domain/schemas";
import { PageHeader } from "@/src/components/PageHeader";
import { PolicyCardView } from "@/src/components/PolicyCardView";
import { usePageTitle } from "@/src/lib/usePageTitle";

const ALL = "全部";
const JINGNING = "景宁畲族自治县";
const DEMO_PLACE = { province: "浙江省", city: "丽水市", county: JINGNING };
const municipalityNames = new Set(["北京市", "天津市", "上海市", "重庆市"]);

const cityTotal = regionProvinces.reduce((total, province) => total + province.cities.length, 0);
const countyTotal = regionProvinces.reduce(
  (total, province) =>
    total + province.cities.reduce((sum, city) => sum + city.counties.length, 0),
  0,
);

function isRegion(value: string | null): value is PolicyRegion {
  return value !== null && (policyRegions as readonly string[]).includes(value);
}

function isCategory(value: string | null): value is PolicyCategory {
  return value !== null && (policyCategories as readonly string[]).includes(value);
}

function placeRegions(provinceName: string, countyName?: string): Set<PolicyRegion> {
  const regions = new Set<PolicyRegion>(["全国"]);
  if (provinceName === "浙江省") regions.add("浙江");
  if (countyName === JINGNING) regions.add("景宁");
  return regions;
}

export default function ResourcesPage() {
  usePageTitle("医保和救助资料");

  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [treatedPlace, setTreatedPlace] = useState("本省医院");

  const province =
    regionProvinces.find((item) => item.name === params.get("province")) ?? null;
  const city = province?.cities.find((item) => item.name === params.get("city")) ?? null;
  const county = city?.counties.find((item) => item.name === params.get("county")) ?? null;
  const isPrecise = city !== null;

  const categoryParam = params.get("category");
  const category: PolicyCategory | typeof ALL = isCategory(categoryParam) ? categoryParam : ALL;

  const rawHashId = location.hash.replace(/^#/, "");
  let hashId = rawHashId;
  try {
    hashId = decodeURIComponent(rawHashId);
  } catch {
    hashId = rawHashId;
  }
  const hashResource = policyResources.find((resource) => resource.id === hashId) ?? null;
  const regionParam = params.get("region");
  const scopeRegion: PolicyRegion | null = isPrecise
    ? null
    : isRegion(regionParam)
      ? regionParam
      : (hashResource?.region ?? null);

  const activeResources = useMemo(
    () => policyResources.filter((resource) => !resource.isArchived),
    [],
  );

  const allowedRegions = useMemo(() => {
    if (isPrecise && province && city) return placeRegions(province.name, county?.name);
    if (scopeRegion) return new Set<PolicyRegion>([scopeRegion]);
    return null;
  }, [city, county?.name, isPrecise, province, scopeRegion]);

  const baseResources = useMemo(
    () =>
      allowedRegions
        ? activeResources.filter((resource) => allowedRegions.has(resource.region))
        : [],
    [activeResources, allowedRegions],
  );

  const filtered = useMemo(
    () =>
      baseResources.filter(
        (resource) =>
          category === ALL || resourceCategories(resource).includes(category),
      ),
    [baseResources, category],
  );

  const showCards = isPrecise || scopeRegion !== null;
  const isMunicipality = province ? municipalityNames.has(province.name) : false;
  const cityLabel = isMunicipality ? "区县" : "城市";
  const jingningHint =
    province?.name === "浙江省" && city?.name === "丽水市" && county === null;

  function goToSearch(next: URLSearchParams, clearHash = false) {
    if (location.hash) {
      navigate(
        {
          pathname: "/resources",
          search: next.toString(),
          hash: clearHash ? "" : location.hash,
        },
        { replace: true },
      );
      return;
    }
    setParams(next, { replace: true });
  }

  function updatePlace(level: "province" | "city" | "county", value: string) {
    const next = new URLSearchParams(params);
    next.delete("region");
    if (level === "province") {
      next.delete("city");
      next.delete("county");
      if (value) next.set("province", value);
      else next.delete("province");
    } else if (level === "city") {
      next.delete("county");
      if (value) next.set("city", value);
      else next.delete("city");
    } else if (value) {
      next.set("county", value);
    } else {
      next.delete("county");
    }
    goToSearch(next, true);
  }

  function selectDemoPlace() {
    const next = new URLSearchParams();
    next.set("province", DEMO_PLACE.province);
    next.set("city", DEMO_PLACE.city);
    next.set("county", DEMO_PLACE.county);
    if (category !== ALL) next.set("category", category);
    goToSearch(next, true);
  }

  function selectJingningCounty() {
    const next = new URLSearchParams(params);
    next.set("county", JINGNING);
    next.delete("region");
    goToSearch(next, true);
  }

  function clearPlace() {
    const next = new URLSearchParams(params);
    for (const key of ["province", "city", "county", "region", "category"]) {
      next.delete(key);
    }
    goToSearch(next, true);
  }

  function backToPlace() {
    const next = new URLSearchParams(params);
    next.delete("region");
    next.delete("category");
    goToSearch(next, true);
  }

  function updateCategory(value: string) {
    const next = new URLSearchParams(params);
    if (value === ALL) next.delete("category");
    else next.set("category", value);
    goToSearch(next);
  }

  const selectedPlace = isPrecise
    ? [province?.name, city?.name, county?.name].filter(Boolean).join(" · ")
    : null;

  const regionSummary = policyRegions
    .map((region) => ({
      region,
      count: filtered.filter((resource) => resource.region === region).length,
    }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.region} ${item.count}`)
    .join(" / ");

  return (
    <>
      <PageHeader
        eyebrow="公开医保和救助资料"
        title="按参保地和事项查入口"
        lead="先选到参保的省市（可继续选到区县），再查看匹配资料。待遇按参保地政策，支付范围按就医地目录。"
      />

      <section className="coverage-panel" aria-labelledby="coverage-title">
        <div className="coverage-panel__head">
          <div>
            <h2 className="section__title" id="coverage-title">
              全国参保地目录
            </h2>
            <p className="section__note">
              已补全 31 个省级地区及其城市、区县名录。选择到具体参保地后，才显示匹配资料。
            </p>
          </div>
          <span className="coverage-panel__badge">
            31 省 · {cityTotal} 城市 · {countyTotal} 区县
          </span>
        </div>

        <div className="filter-panel__grid place-grid">
          <div className="field">
            <label className="field__label" htmlFor="insured-province">
              参保省份
            </label>
            <select
              id="insured-province"
              className="select"
              value={province?.name ?? ""}
              onChange={(event) => updatePlace("province", event.target.value)}
            >
              <option value="">请选择省份</option>
              {regionProvinces.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="insured-city">
              参保{cityLabel}
            </label>
            <select
              id="insured-city"
              className="select"
              value={city?.name ?? ""}
              disabled={!province}
              onChange={(event) => updatePlace("city", event.target.value)}
            >
              <option value="">
                {province ? `请选择${cityLabel}` : "请先选择省份"}
              </option>
              {province?.cities.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {city && city.counties.length > 0 ? (
            <div className="field">
              <label className="field__label" htmlFor="insured-county">
                参保区县
              </label>
              <select
                id="insured-county"
                className="select"
                value={county?.name ?? ""}
                onChange={(event) => updatePlace("county", event.target.value)}
              >
                <option value="">不限定区县（可选）</option>
                {city.counties.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="field__hint">选到区县可获得更精确的地方资料。</span>
            </div>
          ) : null}
        </div>

        <div className="field place-treated">
          <span className="field__label" id="treated-label">
            就医地
          </span>
          <div className="chip-group" role="group" aria-labelledby="treated-label">
            {["本省医院", "省外医院", "还不确定"].map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={treatedPlace === item}
                onClick={() => setTreatedPlace(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="field__hint">
            待遇按参保地政策，支付范围按就医地目录；就医地不改变参保地匹配。
          </span>
        </div>

        <div className="place-summary">
          {isPrecise ? (
            <>
              <span role="status">
                已选参保地 <b>{selectedPlace}</b>
              </span>
              <button type="button" className="link-button" onClick={clearPlace}>
                清除
              </button>
            </>
          ) : province ? (
            <span role="status">
              已选 <b>{province.name}</b>，还差一步：请选择{cityLabel}。
            </span>
          ) : (
            <span role="status">尚未选择参保地。选到{cityLabel}后显示匹配资料。</span>
          )}
        </div>

        {isPrecise && province ? (
          <p className="coverage-panel__note">
            {county?.name === JINGNING ? (
              <>
                浙江省省级资料和景宁第五期「小鹿灯」已按当前参保地列出；具体待遇认定、材料与截止时刻仍需向经办方确认。
              </>
            ) : jingningHint ? (
              <>
                浙江省省级资料已列出。景宁畲族自治县另有第五期「小鹿灯」资料，
                <button type="button" className="link-button" onClick={selectJingningCounty}>
                  选择景宁畲族自治县查看
                </button>
                。
              </>
            ) : province.name === "浙江省" ? (
              <>浙江省省级资料已列出；具体待遇认定和定点机构以参保地办理要求为准。</>
            ) : (
              <>
                该参保地的地方细则尚未收录，显示「待核对」。以下为全国统一制度资料；本地起付线、支付比例和门诊慢特病认定，请通过国家医保服务平台、12393 或参保地医保部门确认。
              </>
            )}
          </p>
        ) : null}

        <p className="field__hint">
          行政区划名录为 {regionDataVersion} 快照，仅用于定位参保地，不代表当地医保待遇已收录。
          <a href={regionDataSource} target="_blank" rel="noreferrer noopener">
            区划数据来源
          </a>
          <span aria-hidden="true"> · </span>
          <a href="https://fuwu.nhsa.gov.cn/" target="_blank" rel="noreferrer noopener">
            国家医保服务平台
          </a>
          <span aria-hidden="true"> · </span>
          全国统一医保服务热线 12393
        </p>
      </section>

      {!showCards ? (
        <section className="card place-empty" aria-labelledby="place-empty-title">
          <h2 className="card__title" id="place-empty-title">
            先选到具体参保地，再显示资料卡
          </h2>
          <p className="card__body">
            为避免把外地政策套到你家，选择省份和{cityLabel}后才会列出匹配资料。全国统一制度会一并显示；本地细则未收录时标为「待核对」。
          </p>
          <p className="card__body">
            当前不显示任何资料卡，也不会改动家庭账本。
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={selectDemoPlace}>
              用示例参保地体验
            </button>
            <a
              className="btn btn--ghost"
              href="https://fuwu.nhsa.gov.cn/"
              target="_blank"
              rel="noreferrer noopener"
            >
              打开国家医保服务平台
            </a>
          </div>
        </section>
      ) : (
        <>
          {scopeRegion ? (
            <div className="scope-banner" role="status">
              <p>
                <b>正在按资料范围「{scopeRegion}」查看。</b>
                这不是你选择的参保地；选择具体参保地后，会改为按参保地匹配，并一并显示全国制度。
              </p>
              <button type="button" className="link-button" onClick={backToPlace}>
                改按参保地查看
              </button>
            </div>
          ) : null}

          <div className="filter-panel">
            <div className="field">
              <span className="field__label" id="category-label">
                办理事项
              </span>
              <div className="chip-group" role="group" aria-labelledby="category-label">
                <button
                  type="button"
                  className="chip"
                  aria-pressed={category === ALL}
                  onClick={() => updateCategory(ALL)}
                >
                  全部
                  <span className="chip__count">{baseResources.length}</span>
                </button>
                {policyCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    aria-pressed={category === item}
                    onClick={() => updateCategory(item)}
                  >
                    {item}
                    <span className="chip__count">{countByCategory(baseResources, item)}</span>
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
              {selectedPlace ? `参保地：${selectedPlace}` : `资料范围：${scopeRegion}`}
              {regionSummary ? ` · ${regionSummary}` : ""}
              {" · 最近核对 "}
              {latestVerifiedAt(filtered) ?? "—"}
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
        </>
      )}
    </>
  );
}
