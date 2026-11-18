import type { CSSProperties } from "react";
import {
  RECOVERY_CATEGORIES,
  RECOVERY_STAGES,
  recoveryTips,
  type RecoveryCategory,
  type RecoveryStage,
  type RecoveryTip,
} from "@/src/data/recovery/recovery";
import { RECOVERY_CATEGORY_HUE, RecoveryCategoryIcon } from "./recoveryMeta";

export type RecoveryCategoryFilter = RecoveryCategory | "全部分类";
export type RecoveryStageFilter = RecoveryStage | "全部阶段";

type Point = { x: number; y: number };

type CategoryNode = {
  category: RecoveryCategory;
  tip: RecoveryTip;
  x: number;
  y: number;
};

const WIDTH = 1000;
const HEIGHT = 720;
const CENTER: Point = { x: WIDTH / 2, y: HEIGHT / 2 };
const RING = { rx: 332, ry: 242 };

const STAGE_POS: Record<RecoveryStage, Point> = {
  住院治疗: { x: 96, y: 74 },
  化疗间歇: { x: 904, y: 74 },
  维持期: { x: 904, y: 646 },
  治疗结束后: { x: 96, y: 646 },
};

const tipsByCategory = new Map(recoveryTips.map((tip) => [tip.category, tip]));

const categoryNodes: CategoryNode[] = RECOVERY_CATEGORIES.flatMap((category, index) => {
  const tip = tipsByCategory.get(category);
  if (!tip) return [];
  const angle = ((-90 + index * 36) * Math.PI) / 180;
  return [
    {
      category,
      tip,
      x: CENTER.x + RING.rx * Math.cos(angle),
      y: CENTER.y + RING.ry * Math.sin(angle),
    },
  ];
});

function curvePath(from: Point, to: Point): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = midX - CENTER.x;
  const dy = midY - CENTER.y;
  const length = Math.hypot(dx, dy) || 1;
  const push = 32;
  const controlX = midX + (dx / length) * push;
  const controlY = midY + (dy / length) * push;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

type RecoveryGraphProps = {
  category: RecoveryCategoryFilter;
  stage: RecoveryStageFilter;
  onSelectCategory: (category: RecoveryCategoryFilter) => void;
  onSelectStage: (stage: RecoveryStageFilter) => void;
};

export function RecoveryGraph({ category, stage, onSelectCategory, onSelectStage }: RecoveryGraphProps) {
  return (
    <div className="recovery-graph">
      <div className="recovery-graph__stage" role="group" aria-label="康复主题与治疗阶段关系图">
        <svg
          className="recovery-graph__edges"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="recovery-graph-glow">
              <stop offset="0" stopColor="var(--site-accent)" stopOpacity="0.12" />
              <stop offset="1" stopColor="var(--site-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CENTER.x} cy={CENTER.y} r="150" fill="url(#recovery-graph-glow)" />
          <ellipse className="recovery-graph__orbit" cx={CENTER.x} cy={CENTER.y} rx={RING.rx} ry={RING.ry} />
          <ellipse
            className="recovery-graph__orbit is-outer"
            cx={CENTER.x}
            cy={CENTER.y}
            rx={RING.rx + 78}
            ry={RING.ry + 66}
          />

          <g>
            {categoryNodes.map((node) => {
              const selected = category === node.category;
              const muted = stage !== "全部阶段" && !node.tip.stages.includes(stage);
              return (
                <path
                  key={`hub-${node.category}`}
                  className={`recovery-graph__hub-edge${selected ? " is-active" : ""}${muted ? " is-muted" : ""}`}
                  d={`M ${CENTER.x} ${CENTER.y} L ${node.x} ${node.y}`}
                />
              );
            })}
          </g>

          <g>
            {categoryNodes.flatMap((node) =>
              node.tip.stages.map((key) => {
                const selected = category === node.category;
                const active = selected || stage === key;
                const muted = stage !== "全部阶段" && stage !== key;
                return (
                  <path
                    key={`${node.category}-${key}`}
                    className={`recovery-graph__stage-edge${active ? " is-active" : ""}${muted ? " is-muted" : ""}`}
                    d={curvePath(node, STAGE_POS[key])}
                  />
                );
              }),
            )}
          </g>
        </svg>

        <button
          type="button"
          className="recovery-hub"
          aria-pressed={category === "全部分类"}
          aria-label={category === "全部分类" ? "全部主题" : "清除主题选择，查看全部主题"}
          onClick={() => onSelectCategory("全部分类")}
        >
          <span className="recovery-hub__eyebrow">康复知识图谱</span>
          <strong className="recovery-hub__title">日常照顾</strong>
          <span className="recovery-hub__meta">
            {category === "全部分类" ? "10 个主题 · 4 个阶段" : `已选 ${category} · 看全部`}
          </span>
        </button>

        {categoryNodes.map((node) => {
          const selected = category === node.category;
          const muted = stage !== "全部阶段" && !node.tip.stages.includes(stage);
          return (
            <button
              key={node.category}
              type="button"
              className={`recovery-node${selected ? " is-selected" : ""}${muted ? " is-muted" : ""}${
                node.category === "紧急情况" ? " is-alert" : ""
              }`}
              style={
                {
                  left: `${(node.x / WIDTH) * 100}%`,
                  top: `${(node.y / HEIGHT) * 100}%`,
                  "--node-hue": RECOVERY_CATEGORY_HUE[node.category],
                } as CSSProperties
              }
              aria-pressed={selected}
              aria-controls="recovery-detail"
              aria-label={`${node.category}：${node.tip.title}，适用于${node.tip.stages.join("、")}${
                muted ? "，不属于当前阶段，点击会清除阶段筛选" : ""
              }`}
              title={muted ? "不属于当前阶段，点击会清除阶段筛选" : undefined}
              onClick={() => onSelectCategory(selected ? "全部分类" : node.category)}
            >
              <span className="recovery-node__icon" aria-hidden="true">
                <RecoveryCategoryIcon category={node.category} />
              </span>
              <span className="recovery-node__label">{node.category}</span>
              <span className="recovery-node__meta">{node.tip.stages.length} 个阶段</span>
            </button>
          );
        })}

        {RECOVERY_STAGES.map((key) => {
          const active = stage === key;
          return (
            <button
              key={key}
              type="button"
              className={`recovery-stage${active ? " is-active" : ""}`}
              style={
                {
                  left: `${(STAGE_POS[key].x / WIDTH) * 100}%`,
                  top: `${(STAGE_POS[key].y / HEIGHT) * 100}%`,
                } as CSSProperties
              }
              aria-pressed={active}
              onClick={() => onSelectStage(active ? "全部阶段" : key)}
            >
              <span className="recovery-stage__dot" aria-hidden="true" />
              <span className="recovery-stage__label">{key}</span>
              <span className="recovery-stage__meta">{active ? "已筛选 · 再点取消" : "筛选阶段"}</span>
            </button>
          );
        })}
      </div>

      <div className="recovery-graph__legend" aria-hidden="true">
        <span>
          <i className="recovery-legend-dot" /> 主题节点
        </span>
        <span>
          <i className="recovery-legend-line is-hub" /> 主题入口
        </span>
        <span>
          <i className="recovery-legend-line is-stage" /> 适用阶段
        </span>
      </div>
      <p className="recovery-graph__note">
        连线只表示这条建议适用于该阶段，不代表因果。点主题看完整建议，点阶段筛选。
      </p>
    </div>
  );
}
