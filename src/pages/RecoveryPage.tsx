import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { RecoveryGarden } from "@/src/components/recovery/RecoveryGarden";
import {
  RecoveryGraph,
  type RecoveryCategoryFilter,
  type RecoveryStageFilter,
} from "@/src/components/recovery/RecoveryGraph";
import { RECOVERY_CATEGORY_HUE } from "@/src/components/recovery/recoveryMeta";
import { RecoveryTipCard } from "@/src/components/recovery/RecoveryTipCard";
import {
  RECOVERY_CATEGORIES,
  RECOVERY_STAGES,
  recoveryTips,
} from "@/src/data/recovery/recovery";
import { useMediaQuery } from "@/src/lib/useMediaQuery";
import { usePageTitle } from "@/src/lib/usePageTitle";

type View = "graph" | "cards";

const CATEGORY_FILTERS: RecoveryCategoryFilter[] = ["全部分类", ...RECOVERY_CATEGORIES];
const STAGE_FILTERS: RecoveryStageFilter[] = ["全部阶段", ...RECOVERY_STAGES];
const startTip = recoveryTips.find((tip) => tip.category === "感染预防");

export default function RecoveryPage() {
  usePageTitle("康复建议");
  const [category, setCategory] = useState<RecoveryCategoryFilter>("全部分类");
  const [stage, setStage] = useState<RecoveryStageFilter>("全部阶段");
  const [view, setView] = useState<View>("graph");
  const { hash } = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isSplit = useMediaQuery("(min-width: 1280px)");
  const detailRef = useRef<HTMLElement>(null);
  const shouldScrollToDetail = useRef(false);

  const effectiveView: View = isDesktop ? view : "cards";
  const tips = recoveryTips.filter(
    (tip) =>
      (category === "全部分类" || tip.category === category) &&
      (stage === "全部阶段" || tip.stages.includes(stage)),
  );
  const selectedTip =
    category === "全部分类" ? null : recoveryTips.find((tip) => tip.category === category) ?? null;

  const status =
    effectiveView === "graph"
      ? category !== "全部分类"
        ? `已选 ${category}${stage !== "全部阶段" ? ` · ${stage}` : ""}`
        : stage !== "全部阶段"
          ? `当前阶段 ${stage} · ${tips.length} 个主题`
          : `${recoveryTips.length} 个主题 · ${RECOVERY_STAGES.length} 个阶段`
      : `当前有 ${tips.length} 张建议卡`;

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) {
      setCategory("全部分类");
      setStage("全部阶段");
      return;
    }
    const tip = recoveryTips.find((item) => item.id === id);
    if (!tip) return;
    setCategory(tip.category);
    setStage("全部阶段");
  }, [hash]);

  useEffect(() => {
    if (!shouldScrollToDetail.current || isSplit || !selectedTip) return;
    shouldScrollToDetail.current = false;
    const node = detailRef.current;
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [selectedTip, isSplit]);

  function chooseCategory(next: RecoveryCategoryFilter) {
    if (next === "全部分类") {
      shouldScrollToDetail.current = false;
      setCategory("全部分类");
      return;
    }
    const tip = recoveryTips.find((item) => item.category === next);
    if (tip && stage !== "全部阶段" && !tip.stages.includes(stage)) {
      setStage("全部阶段");
    }
    setCategory(next);
  }

  function chooseGraphCategory(next: RecoveryCategoryFilter) {
    shouldScrollToDetail.current = next !== "全部分类" && !isSplit;
    chooseCategory(next);
  }

  function chooseStage(next: RecoveryStageFilter) {
    setStage(next);
    if (next === "全部阶段" || category === "全部分类") return;
    const tip = recoveryTips.find((item) => item.category === category);
    if (tip && !tip.stages.includes(next)) {
      setCategory("全部分类");
    }
  }

  function showStartTip() {
    shouldScrollToDetail.current = false;
    chooseCategory("感染预防");
  }

  return (
    <div className="page page--recovery">
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>

      <header className="recovery-hero">
        <div className="recovery-hero__copy">
          <p className="recovery-hero__eyebrow">康复建议 · 日常照顾</p>
          <h1 className="recovery-hero__title">治疗之外，日子怎么过</h1>
          <p className="recovery-hero__lead">
            这里按类别整理治疗期间常见的生活提醒：可以做什么、不要做什么、什么时候该联系医院。具体怎么做，按孩子所在医院治疗团队的安排来。
          </p>
          <ul className="recovery-hero__meta">
            <li>{RECOVERY_CATEGORIES.length} 个生活主题</li>
            <li>{RECOVERY_STAGES.length} 个治疗阶段</li>
            <li>每条都写明何时联系医院</li>
          </ul>
        </div>
        <RecoveryGarden />
      </header>

      <aside className="cross-link print-hide">
        <div>
          <p className="cross-link__title">要去复诊？</p>
          <p>把想问的问题和这阵子观察到的情况整理成一页，打印或截屏带去。</p>
        </div>
        <Link to="/checkup" className="text-button">
          打开复诊清单
        </Link>
      </aside>

      <section className="recovery-filters" aria-label="筛选康复建议">
        <div className="recovery-filters__head">
          <div>
            <p className="recovery-filters__eyebrow">
              {effectiveView === "graph" ? "康复知识图谱" : "建议卡列表"}
            </p>
            <p className="recovery-filters__hint">
              {effectiveView === "graph"
                ? "点主题节点查看完整建议，点阶段节点只看这个阶段。"
                : "按生活主题或治疗阶段筛选，每张卡都写明何时联系医院。"}
            </p>
          </div>

          {isDesktop && (
            <div className="recovery-view-switch" role="group" aria-label="切换查看方式">
              <button
                type="button"
                className={view === "graph" ? "is-active" : ""}
                aria-pressed={view === "graph"}
                onClick={() => setView("graph")}
              >
                知识图谱
              </button>
              <button
                type="button"
                className={view === "cards" ? "is-active" : ""}
                aria-pressed={view === "cards"}
                onClick={() => setView("cards")}
              >
                卡片列表
              </button>
            </div>
          )}
        </div>

        {effectiveView === "cards" && (
          <div className="recovery-filters__group">
            <p className="recovery-filters__label" id="recovery-category-label">
              按类别
            </p>
            <div className="filter-row" role="group" aria-labelledby="recovery-category-label">
              {CATEGORY_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === category ? "filter-chip is-active" : "filter-chip"}
                  aria-pressed={item === category}
                  style={item === "全部分类" ? undefined : ({ "--chip-hue": RECOVERY_CATEGORY_HUE[item] } as CSSProperties)}
                  onClick={() => chooseCategory(item)}
                >
                  {item !== "全部分类" && <span className="filter-chip__dot" aria-hidden="true" />}
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="recovery-filters__group">
          <p className="recovery-filters__label" id="recovery-stage-label">
            按阶段
          </p>
          <div className="filter-row" role="group" aria-labelledby="recovery-stage-label">
            {STAGE_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={item === stage ? "filter-chip is-active" : "filter-chip"}
                aria-pressed={item === stage}
                onClick={() => chooseStage(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="filter-count">{status}</p>
      </section>

      <p className="sr-only" aria-live="polite">
        {selectedTip ? `已显示 ${selectedTip.category}：${selectedTip.title}` : "尚未选择主题"}
      </p>

      {effectiveView === "graph" ? (
        <div className="recovery-graph-layout">
          <RecoveryGraph
            category={category}
            stage={stage}
            onSelectCategory={chooseGraphCategory}
            onSelectStage={chooseStage}
          />

          <aside className="recovery-detail" id="recovery-detail" ref={detailRef} aria-label="建议详情">
            {selectedTip ? (
              <>
                <div className="recovery-detail__bar">
                  <p className="recovery-detail__eyebrow">图谱详情</p>
                  <button type="button" className="recovery-detail__clear" onClick={() => chooseCategory("全部分类")}>
                    看全部主题
                  </button>
                </div>
                <RecoveryTipCard tip={selectedTip} />
              </>
            ) : (
              <div className="recovery-detail__empty">
                <span className="recovery-detail__icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="24" r="18" strokeDasharray="3 4" />
                    <path d="M30 18 26.5 26.5 18 30l3.5-8.5L30 18Z" fill="currentColor" fillOpacity="0.14" />
                    <circle cx="24" cy="24" r="2.2" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <h2 className="recovery-detail__title">从图谱里选一个主题</h2>
                <p>可以做什么、不要做什么、什么时候联系医院，会显示在这里。</p>
                {startTip && (
                  <button type="button" className="recovery-detail__start" onClick={showStartTip}>
                    从「感染预防」开始
                  </button>
                )}
                <p className="recovery-detail__note">也可以点四个角上的阶段，只看这个阶段的主题。</p>
              </div>
            )}
          </aside>
        </div>
      ) : tips.length === 0 ? (
        <div className="recovery-empty">
          <svg className="recovery-empty__art" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 54V28" stroke="var(--site-border-strong)" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 36c-9 0-14-5-14-13 9 0 14 5 14 13Z" fill="var(--hue-leaf)" opacity="0.7" />
            <path d="M32 30c0-8 5-13 13-13 0 8-5 13-13 13Z" fill="var(--hue-mint)" opacity="0.8" />
            <circle cx="32" cy="24" r="4" fill="var(--hue-sun)" />
          </svg>
          <p className="recovery-empty__text">这个组合暂时没有卡片，换一个分类或阶段看看。</p>
        </div>
      ) : (
        <div className="recovery-grid">
          {tips.map((tip) => (
            <RecoveryTipCard key={tip.id} tip={tip} />
          ))}
        </div>
      )}

      <p className="recovery-boundary">
        康复训练要在治疗团队或康复治疗师指导下进行。
      </p>
    </div>
  );
}
