import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/src/components/PageHeader";
import { policyResources } from "@/src/data/policies/resources";
import { regionProvinces } from "@/src/data/regions";
import type { ArchiveType } from "@/src/domain/documents";
import {
  buildRoute,
  resourceLink,
  routeProgress,
  routeStepStates,
  routeStoreKey,
  treatedPlaces,
  type InsuredPlace,
  type RouteStepState,
  type TreatedPlace,
} from "@/src/domain/route";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import { loadValue, saveValue } from "@/src/lib/localStore";
import { usePageTitle } from "@/src/lib/usePageTitle";

const municipalityNames = new Set(["北京市", "天津市", "上海市", "重庆市"]);

type StoredRoute = {
  place: InsuredPlace;
  treated: TreatedPlace;
  states: Record<string, RouteStepState>;
};

const emptyRoute: StoredRoute = {
  place: { province: "", city: "", county: "" },
  treated: "本省医院",
  states: {},
};

const demoRoute: StoredRoute = {
  place: { province: "浙江省", city: "丽水市", county: "景宁畲族自治县" },
  treated: "本省医院",
  states: { "insured-status": "已办", "outpatient-chronic": "已办" },
};

const resourceTitles = new Map(policyResources.map((resource) => [resource.id, resource.title]));

export default function RoutePage() {
  usePageTitle("我家的路线");

  const { isDemo, modeLabel } = useWorkspace();
  const { docs } = useDocuments();
  const [route, setRoute] = useState<StoredRoute>(isDemo ? demoRoute : emptyRoute);
  const [hydrated, setHydrated] = useState(isDemo);

  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    void loadValue<StoredRoute>(routeStoreKey).then((stored) => {
      if (cancelled) return;
      if (stored?.place) setRoute({ ...emptyRoute, ...stored });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  useEffect(() => {
    if (isDemo || !hydrated) return;
    void saveValue(routeStoreKey, route);
  }, [isDemo, hydrated, route]);

  const { place, treated, states } = route;
  const province = regionProvinces.find((item) => item.name === place.province) ?? null;
  const city = province?.cities.find((item) => item.name === place.city) ?? null;
  const cityLabel = province && municipalityNames.has(province.name) ? "区县" : "城市";
  const placeReady = city !== null;

  const steps = useMemo(() => buildRoute(place, treated), [place, treated]);
  const progress = routeProgress(steps, states);

  const docCounts = useMemo(() => {
    const counts = new Map<ArchiveType, number>();
    docs.forEach((doc) => counts.set(doc.archiveType, (counts.get(doc.archiveType) ?? 0) + 1));
    return counts;
  }, [docs]);

  function setPlace(level: keyof InsuredPlace, value: string) {
    setRoute((previous) => {
      const next = { ...previous.place, [level]: value };
      if (level === "province") {
        next.city = "";
        next.county = "";
      }
      if (level === "city") next.county = "";
      return { ...previous, place: next };
    });
  }

  function setStepState(id: string, state: RouteStepState) {
    setRoute((previous) => ({ ...previous, states: { ...previous.states, [id]: state } }));
  }

  const placeText = [place.province, place.city, place.county].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        eyebrow="我家的路线"
        title="按参保地排好要办的事，一步一步来"
        lead="选好参保地和就医地，下面会按顺序列出医保结算、救助和公益项目各要办什么、带什么票据。本站不判断资格，具体以经办方为准。"
      />

      <section className="coverage-panel" aria-labelledby="route-place-title">
        <h2 className="section__title" id="route-place-title">
          先说清两件事
        </h2>
        <div className="filter-panel__grid place-grid">
          <div className="field">
            <label className="field__label" htmlFor="route-province">
              参保省份
            </label>
            <select
              id="route-province"
              className="select"
              value={place.province}
              onChange={(event) => setPlace("province", event.target.value)}
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
            <label className="field__label" htmlFor="route-city">
              参保{cityLabel}
            </label>
            <select
              id="route-city"
              className="select"
              value={place.city}
              disabled={!province}
              onChange={(event) => setPlace("city", event.target.value)}
            >
              <option value="">{province ? `请选择${cityLabel}` : "请先选择省份"}</option>
              {province?.cities.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {city && city.counties.length > 0 ? (
            <div className="field">
              <label className="field__label" htmlFor="route-county">
                参保区县
              </label>
              <select
                id="route-county"
                className="select"
                value={place.county}
                onChange={(event) => setPlace("county", event.target.value)}
              >
                <option value="">不限定区县（可选）</option>
                {city.counties.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="field place-treated">
          <span className="field__label" id="route-treated-label">
            孩子在哪治疗
          </span>
          <div className="chip-group" role="group" aria-labelledby="route-treated-label">
            {treatedPlaces.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={treated === item}
                onClick={() => setRoute((previous) => ({ ...previous, treated: item }))}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="field__hint">
            医院在参保省以外时，会多出一步「异地就医备案」。
          </span>
        </div>
        <p className="field__hint">
          {isDemo
            ? `当前为${modeLabel}，示例参保地为景宁，进度不保存。`
            : "参保地、就医地和每步进度保存在这台设备的浏览器里，不会上传。"}
        </p>
      </section>

      {!placeReady ? (
        <section className="card place-empty" aria-labelledby="route-empty-title">
          <h2 className="card__title" id="route-empty-title">
            选到参保{cityLabel}后显示路线
          </h2>
          <p className="card__body">
            为了不把外地政策套到你家，先选参保地。还不清楚孩子在哪参保，可以问医院医保窗口，或拨打全国医保服务热线 12393。
          </p>
        </section>
      ) : (
        <>
          <div className="progress-card">
            <div className="progress-card__row">
              <p className="progress-card__label">
                已办 {progress.done} / {progress.applicable} 步
              </p>
              <p className="progress-card__value">参保地：{placeText} · 就医：{treated}</p>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.applicable}
              aria-valuenow={progress.done}
              aria-valuetext={`已办 ${progress.done} 步，共 ${progress.applicable} 步`}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${progress.applicable ? Math.round((progress.done / progress.applicable) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="meta-line">
              标为「不适用」的步骤不计入。状态只是你自己的记录，不代表经办方已受理。
            </p>
          </div>

          <ol className="route-steps">
            {steps.map((step, index) => {
              const state = states[step.id] ?? "未办";
              const selectId = `route-state-${step.id}`;
              return (
                <li
                  key={step.id}
                  className={`route-step route-step--${state === "已办" ? "done" : state === "不适用" ? "skip" : "todo"}`}
                >
                  <div className="route-step__head">
                    <span className="route-step__num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="route-step__title">{step.title}</h2>
                    <span
                      className={`tag ${state === "已办" ? "tag--ok" : state === "不适用" ? "tag--muted" : "tag--warm"}`}
                    >
                      {state}
                    </span>
                  </div>
                  <p className="card__body">{step.why}</p>
                  {step.conditional ? <p className="meta-line">{step.conditional}</p> : null}

                  <p
                    className={`route-step__local route-step__local--${step.localNote.kind}`}
                  >
                    {step.localNote.text}
                  </p>

                  <p className="subhead">要准备</p>
                  <ul className="plain-list plain-list--tight">
                    {step.materials.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {step.receiptTypes.length > 0 ? (
                    <p className="meta-line">
                      本机已有：
                      {step.receiptTypes
                        .map((type) => `${type} ${docCounts.get(type) ?? 0} 份`)
                        .join(" · ")}
                    </p>
                  ) : null}

                  <p className="subhead">资料卡</p>
                  <ul className="plain-list plain-list--tight">
                    {step.resourceIds.map((id) => (
                      <li key={id}>
                        <Link to={resourceLink(place, id)}>{resourceTitles.get(id) ?? id}</Link>
                      </li>
                    ))}
                  </ul>

                  <div className="material-item__controls">
                    <label htmlFor={selectId}>这一步</label>
                    <select
                      id={selectId}
                      className="select"
                      value={state}
                      onChange={(event) =>
                        setStepState(step.id, event.target.value as RouteStepState)
                      }
                    >
                      {routeStepStates.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {step.links.map((link) => (
                      <Link key={link.to} className="btn btn--ghost btn--small" to={link.to}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="notice">
            顺序按常见办理先后排列，各地可能不同；同一时期可以并行准备。标「待核对」的地方，本站没有收录该地细则，不代表没有政策。
          </p>
        </>
      )}
    </>
  );
}
