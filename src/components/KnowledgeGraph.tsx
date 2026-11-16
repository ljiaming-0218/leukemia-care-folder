import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  knowledgeGraphEdges,
  knowledgeGraphNodeIds,
  knowledgeGraphPaths,
  type KnowledgeGraphEdge,
  type KnowledgeGraphPath,
} from "@/src/data/knowledge/graph";
import { glossaryEntries, glossaryGroups } from "@/src/data/knowledge/glossary";
import type { GlossaryEntry, GlossaryGroup } from "@/src/domain/schemas";
import { useAssistant } from "@/src/features/assistant/AssistantContext";
import { SourceLine } from "@/src/components/SourceLine";

const COLUMN_X: Record<GlossaryGroup, number> = {
  疾病与分型: -340,
  检查与报告: -170,
  治疗与护理: 0,
  用药: 170,
  费用与票据: 340,
};

const COLUMN_Z: Record<GlossaryGroup, number> = {
  疾病与分型: 40,
  检查与报告: 150,
  治疗与护理: 220,
  用药: 150,
  费用与票据: 40,
};

const GROUP_VAR: Record<GlossaryGroup, string> = {
  疾病与分型: "--kg-disease",
  检查与报告: "--kg-check",
  治疗与护理: "--kg-treatment",
  用药: "--kg-drug",
  费用与票据: "--kg-cost",
};

const shortLabels: Record<string, string> = {
  leukemia: "白血病",
  all: "ALL",
  aml: "AML",
  apl: "APL",
  "risk-stratification": "危险度分层",
  remission: "完全缓解",
  relapse: "复发",
  "bone-marrow-aspiration": "骨髓穿刺",
  immunophenotype: "免疫分型",
  karyotype: "染色体核型",
  "fusion-gene": "融合基因",
  mrd: "MRD",
  "lumbar-puncture": "腰椎穿刺",
  "blood-count": "血常规",
  induction: "诱导缓解",
  consolidation: "巩固治疗",
  maintenance: "维持治疗",
  intrathecal: "鞘内注射",
  "central-line": "PICC",
  myelosuppression: "骨髓抑制",
  "febrile-neutropenia": "粒缺伴发热",
  glucocorticoid: "糖皮质激素",
  methotrexate: "甲氨蝶呤",
  atra: "全反式维甲酸",
  "resident-insurance": "基本医保",
  "critical-illness-insurance": "大病保险",
  "medical-assistance": "医疗救助",
  "settlement-slip": "医保结算单",
  "e-invoice": "电子票据",
  "invoice-number": "票号",
  "out-of-catalog": "目录外自费",
};

const DEFAULT_YAW = 0.14;
const DEFAULT_PITCH = 0.16;
const CAMERA_DISTANCE = 1400;

type PositionedNode = {
  entry: GlossaryEntry;
  x: number;
  y: number;
  z: number;
  degree: number;
};

type ProjectedNode = PositionedNode & {
  sx: number;
  sy: number;
  depth: number;
  perspective: number;
};

function buildNodes(): PositionedNode[] {
  const entriesById = new Map(glossaryEntries.map((entry) => [entry.id, entry]));
  const counts = new Map<GlossaryGroup, number>();
  knowledgeGraphNodeIds.forEach((id) => {
    const entry = entriesById.get(id);
    if (!entry) return;
    counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);
  });
  const seen = new Map<GlossaryGroup, number>();
  const degrees = new Map<string, number>();
  knowledgeGraphEdges.forEach((edge) => {
    degrees.set(edge.from, (degrees.get(edge.from) ?? 0) + 1);
    degrees.set(edge.to, (degrees.get(edge.to) ?? 0) + 1);
  });

  return knowledgeGraphNodeIds.flatMap((id) => {
    const entry = entriesById.get(id);
    if (!entry) return [];
    const index = seen.get(entry.group) ?? 0;
    seen.set(entry.group, index + 1);
    const total = counts.get(entry.group) ?? 1;
    const spacing = total >= 7 ? 56 : total >= 6 ? 60 : 64;
    const jitter = ((index % 3) - 1) * 18;
    return [
      {
        entry,
        x: COLUMN_X[entry.group] + jitter,
        y: (index - (total - 1) / 2) * spacing,
        z: COLUMN_Z[entry.group] + ((index % 2) * 2 - 1) * 16,
        degree: degrees.get(id) ?? 0,
      },
    ];
  });
}

function projectNode(
  node: Pick<PositionedNode, "x" | "y" | "z">,
  yaw: number,
  pitch: number,
  base: number,
  width: number,
  height: number,
): { sx: number; sy: number; depth: number; perspective: number } {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x1 = node.x * cosYaw - node.z * sinYaw;
  const z1 = node.x * sinYaw + node.z * cosYaw;
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const y1 = node.y * cosPitch - z1 * sinPitch;
  const z2 = node.y * sinPitch + z1 * cosPitch;
  const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE + z2);
  return {
    sx: width / 2 + x1 * base * perspective,
    sy: height / 2 + 18 + y1 * base * perspective,
    depth: z2,
    perspective,
  };
}

type EdgeSelection = {
  edge: KnowledgeGraphEdge;
  selected: boolean;
  inPath: boolean;
};

export function KnowledgeGraph() {
  const { open: openAssistant } = useAssistant();
  const [groupFilter, setGroupFilter] = useState<GlossaryGroup | "全部">("全部");
  const [pathId, setPathId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("leukemia");
  const [autoRotate, setAutoRotate] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const nodes = useMemo(() => buildNodes(), []);
  const entriesById = useMemo(
    () => new Map(glossaryEntries.map((entry) => [entry.id, entry])),
    [],
  );

  const activePath = useMemo(
    () => knowledgeGraphPaths.find((path) => path.id === pathId) ?? null,
    [pathId],
  );

  const activeIds = useMemo(() => {
    if (activePath) return new Set(activePath.nodeIds);
    if (groupFilter === "全部") return new Set(nodes.map((node) => node.entry.id));
    const ids = new Set(
      nodes.filter((node) => node.entry.group === groupFilter).map((node) => node.entry.id),
    );
    knowledgeGraphEdges.forEach((edge) => {
      if (ids.has(edge.from)) ids.add(edge.to);
      if (ids.has(edge.to)) ids.add(edge.from);
    });
    return ids;
  }, [activePath, groupFilter, nodes]);

  const effectiveSelected = activeIds.has(selectedId)
    ? selectedId
    : (activePath?.nodeIds[0] ??
      nodes.find((node) => activeIds.has(node.entry.id))?.entry.id ??
      selectedId);
  const selectedEntry = entriesById.get(effectiveSelected);

  const edgeSelections = useMemo<EdgeSelection[]>(() => {
    const pathPairs = new Set(
      (activePath?.pairs ?? []).map(([from, to]) => `${from}->${to}`),
    );
    return knowledgeGraphEdges.map((edge) => ({
      edge,
      selected: edge.from === effectiveSelected || edge.to === effectiveSelected,
      inPath: pathPairs.has(`${edge.from}->${edge.to}`),
    }));
  }, [activePath, effectiveSelected]);

  const relations = useMemo(() => {
    if (!selectedEntry) return [];
    return knowledgeGraphEdges.flatMap((edge) => {
      if (edge.from === selectedEntry.id) {
        const target = entriesById.get(edge.to);
        return target ? [{ id: edge.to, label: edge.label, entry: target }] : [];
      }
      if (edge.to === selectedEntry.id) {
        const target = entriesById.get(edge.from);
        return target ? [{ id: edge.from, label: edge.label, entry: target }] : [];
      }
      return [];
    });
  }, [entriesById, selectedEntry]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLButtonElement>());
  const yawRef = useRef(DEFAULT_YAW);
  const pitchRef = useRef(DEFAULT_PITCH);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const activeRef = useRef(activeIds);
  const selectedRef = useRef(effectiveSelected);
  const autoRef = useRef(autoRotate);
  const edgeRef = useRef(edgeSelections);
  const dirtyRef = useRef(true);

  activeRef.current = activeIds;
  selectedRef.current = effectiveSelected;
  autoRef.current = autoRotate;
  edgeRef.current = edgeSelections;
  dirtyRef.current = true;

  useEffect(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(document.documentElement);
    const groupColors = Object.fromEntries(
      glossaryGroups.map((group) => [group, style.getPropertyValue(GROUP_VAR[group]).trim()]),
    ) as Record<GlossaryGroup, string>;
    const surface = style.getPropertyValue("--site-surface").trim() || "#fffdf7";
    const ink = style.getPropertyValue("--site-fg").trim() || "#1b2623";
    const fontFamily =
      style.getPropertyValue("--site-font").trim() ||
      "system-ui, -apple-system, 'Segoe UI', sans-serif";

    let frame = 0;
    let lastYaw = Number.NaN;
    let lastPitch = Number.NaN;
    let lastWidth = 0;
    let lastHeight = 0;

    const render = (time: number) => {
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      if (!width || !height) return;
      const mobile = width < 640;
      const autoYaw = autoRef.current ? Math.sin(time * 0.00028) * 0.26 : 0;
      const yaw = yawRef.current + autoYaw;
      const pitch = pitchRef.current;

      if (
        !dirtyRef.current &&
        yaw === lastYaw &&
        pitch === lastPitch &&
        width === lastWidth &&
        height === lastHeight
      ) {
        return;
      }
      lastYaw = yaw;
      lastPitch = pitch;
      lastWidth = width;
      lastHeight = height;
      dirtyRef.current = false;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const base = mobile
        ? Math.min(width / 700, height / 520)
        : Math.min(width / 900, height / 600);
      const projected: ProjectedNode[] = nodes.map((node) => {
        const point = projectNode(
          mobile ? { ...node, x: node.x * 0.92, y: node.y * 1.2 } : node,
          yaw,
          pitch,
          base,
          width,
          height,
        );
        return { ...node, ...point };
      });
      const byId = new Map(projected.map((node) => [node.entry.id, node]));
      const active = activeRef.current;
      const selected = selectedRef.current;
      const selections = edgeRef.current;

      const drawableEdges = selections.flatMap((selection) => {
        const from = byId.get(selection.edge.from);
        const to = byId.get(selection.edge.to);
        if (!from || !to) return [];
        if (!active.has(selection.edge.from) || !active.has(selection.edge.to)) return [];
        return [{ selection, from, to, depth: (from.depth + to.depth) / 2 }];
      });
      drawableEdges.sort((a, b) => b.depth - a.depth);

      drawableEdges.forEach(({ selection, from, to }) => {
        const strong = selection.selected || selection.inPath;
        const color = groupColors[from.entry.group] || ink;
        ctx.save();
        ctx.globalAlpha = selection.selected ? 0.9 : selection.inPath ? 0.65 : 0.2;
        ctx.strokeStyle = color;
        ctx.lineWidth = selection.selected ? 2.2 : selection.inPath ? 1.8 : 1.1;
        ctx.beginPath();
        ctx.moveTo(from.sx, from.sy);
        ctx.lineTo(to.sx, to.sy);
        ctx.stroke();
        ctx.restore();

        if (strong) {
          const angle = Math.atan2(to.sy - from.sy, to.sx - from.sx);
          const tipX = from.sx + (to.sx - from.sx) * 0.82;
          const tipY = from.sy + (to.sy - from.sy) * 0.82;
          ctx.save();
          ctx.globalAlpha = selection.selected ? 0.95 : 0.7;
          ctx.fillStyle = color;
          ctx.translate(tipX, tipY);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-7, 3.4);
          ctx.lineTo(-7, -3.4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        if (strong && width >= 560) {
          const dx = to.sx - from.sx;
          const dy = to.sy - from.sy;
          const length = Math.hypot(dx, dy) || 1;
          const midX = (from.sx + to.sx) / 2 - (dy / length) * 11;
          const midY = (from.sy + to.sy) / 2 + (dx / length) * 11;
          ctx.save();
          ctx.font = `500 11px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const textWidth = ctx.measureText(selection.edge.label).width;
          ctx.fillStyle = surface;
          ctx.globalAlpha = 0.92;
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = color;
          ctx.fillText(selection.edge.label, midX, midY);
          ctx.restore();
        }
      });

      if (width >= 620) {
        const minY = new Map<GlossaryGroup, number>();
        projected.forEach((node) => {
          const current = minY.get(node.entry.group);
          minY.set(node.entry.group, current === undefined ? node.y : Math.min(current, node.y));
        });
        glossaryGroups.forEach((group) => {
          const groupActive =
            activePathGroupActive(group, active) || groupFilter === "全部" || groupFilter === group;
          const point = projectNode(
            {
              x: COLUMN_X[group],
              y: (minY.get(group) ?? 0) - 46,
              z: COLUMN_Z[group],
            },
            yaw,
            pitch,
            base,
            width,
            height,
          );
          ctx.save();
          ctx.globalAlpha = groupActive ? 0.9 : 0.2;
          ctx.fillStyle = groupColors[group] || ink;
          ctx.font = `600 12px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(group, point.sx, point.sy);
          ctx.restore();
        });
      }

      const sorted = [...projected].sort((a, b) => b.depth - a.depth);
      sorted.forEach((node) => {
        const el = nodeEls.current.get(node.entry.id);
        if (!el) return;
        const isActive = active.has(node.entry.id);
        const isSelected = node.entry.id === selected;
        const scale = (isSelected ? 1.1 : 1) * Math.min(Math.max(node.perspective, 0.82), 1.24);
        el.style.transform = `translate3d(${node.sx}px, ${node.sy}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = isActive ? "1" : "0.16";
        el.style.zIndex = String(isSelected ? 2000 : Math.round(1200 - node.depth));
        el.style.pointerEvents = isActive ? "auto" : "none";
      });
    };

    const loop = (time: number) => {
      render(time);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      dirtyRef.current = true;
    });
    observer.observe(viewport);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [nodes, groupFilter, activePath]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    movedRef.current = false;
    if ((event.target as HTMLElement).closest("button")) return;
    draggingRef.current = true;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    viewportRef.current?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const dx = event.clientX - lastPointer.current.x;
    const dy = event.clientY - lastPointer.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) movedRef.current = true;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    yawRef.current = Math.max(-0.75, Math.min(0.75, yawRef.current + dx * 0.005));
    pitchRef.current = Math.max(-0.35, Math.min(0.55, pitchRef.current + dy * 0.0035));
    dirtyRef.current = true;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }
  }

  function rotate(deltaYaw: number, deltaPitch: number) {
    yawRef.current = Math.max(-0.75, Math.min(0.75, yawRef.current + deltaYaw));
    pitchRef.current = Math.max(-0.35, Math.min(0.55, pitchRef.current + deltaPitch));
    dirtyRef.current = true;
  }

  function resetView() {
    yawRef.current = DEFAULT_YAW;
    pitchRef.current = DEFAULT_PITCH;
    dirtyRef.current = true;
  }

  if (!selectedEntry) return null;

  return (
    <section className="knowledge-graph" aria-labelledby="graph-title">
      <div className="knowledge-graph__intro">
        <div>
          <h2 className="section__title" id="graph-title">
            一张图看懂概念怎么连起来
          </h2>
          <p className="section__note">
            拖动旋转这张 3D 概念图，选一个术语查看它和分型、检查、治疗、费用之间的关系。点节点查看白话解释；完整定义仍以术语表为准。
          </p>
        </div>
        <p className="knowledge-graph__stats">
          {knowledgeGraphNodeIds.length} 个核心概念 · {knowledgeGraphEdges.length} 条关系
        </p>
      </div>

      <div className="chip-group kg-filters" role="group" aria-label="按类别聚焦图谱">
        <button
          type="button"
          className="chip"
          aria-pressed={groupFilter === "全部" && !activePath}
          onClick={() => {
            setGroupFilter("全部");
            setPathId(null);
          }}
        >
          全部
          <span className="chip__count">{nodes.length}</span>
        </button>
        {glossaryGroups.map((group) => (
          <button
            key={group}
            type="button"
            className="chip"
            aria-pressed={groupFilter === group && !activePath}
            onClick={() => {
              setGroupFilter(group);
              setPathId(null);
            }}
          >
            {group}
            <span className="chip__count">
              {nodes.filter((node) => node.entry.group === group).length}
            </span>
          </button>
        ))}
      </div>

      <div className="kg-paths" aria-label="按处境查看图谱路径">
        <span className="kg-paths__label">按处境看</span>
        {knowledgeGraphPaths.map((path) => (
          <button
            key={path.id}
            type="button"
            className="kg-path"
            aria-pressed={pathId === path.id}
            onClick={() => {
              if (pathId === path.id) {
                setPathId(null);
                return;
              }
              setPathId(path.id);
              setGroupFilter("全部");
              setSelectedId(path.nodeIds[0]);
            }}
          >
            {path.title}
            <span className="chip__count">{path.nodeIds.length}</span>
          </button>
        ))}
      </div>

      {activePath ? (
        <p className="kg-path-note" role="status">
          <b>{activePath.title}</b>
          {activePath.description}
          <button type="button" className="kg-path-note__clear" onClick={() => setPathId(null)}>
            退出路径
          </button>
        </p>
      ) : null}

      <div className="kg3d-shell">
        <div
          className="kg3d-viewport"
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="application"
          aria-label="3D 知识图谱，可拖动旋转。使用下方按钮和下拉框选择术语。"
        >
          <canvas ref={canvasRef} className="kg3d-canvas" aria-hidden="true" />
          <div className="kg3d-nodes">
            {nodes.map((node) => {
              const active = activeIds.has(node.entry.id);
              const selected = node.entry.id === effectiveSelected;
              return (
                <button
                  key={node.entry.id}
                  ref={(el) => {
                    if (el) nodeEls.current.set(node.entry.id, el);
                    else nodeEls.current.delete(node.entry.id);
                  }}
                  type="button"
                  className={[
                    "kg3d-node",
                    active ? "" : "kg3d-node--dim",
                    selected ? "kg3d-node--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    {
                      "--kg-color": `var(${GROUP_VAR[node.entry.group]})`,
                    } as CSSProperties
                  }
                  disabled={!active}
                  tabIndex={active ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={`${node.entry.term}，${node.entry.group}`}
                  onClick={() => {
                    if (movedRef.current) return;
                    setSelectedId(node.entry.id);
                    dirtyRef.current = true;
                  }}
                >
                  <span className="kg3d-node__dot" aria-hidden="true" />
                  <span className="kg3d-node__label">
                    {shortLabels[node.entry.id] ?? node.entry.term}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="kg3d-badge" aria-hidden="true">
            3D · 拖动旋转
          </span>
        </div>
      </div>

      <div className="kg3d-controls">
        <div className="kg3d-controls__rotate" role="group" aria-label="旋转图谱">
          <button type="button" className="kg-ctrl" onClick={() => rotate(-0.16, 0)}>
            左转
          </button>
          <button type="button" className="kg-ctrl" onClick={() => rotate(0.16, 0)}>
            右转
          </button>
          <button type="button" className="kg-ctrl" onClick={() => rotate(0, -0.1)}>
            上仰
          </button>
          <button type="button" className="kg-ctrl" onClick={() => rotate(0, 0.1)}>
            下俯
          </button>
          <button type="button" className="kg-ctrl" onClick={resetView}>
            复位
          </button>
        </div>
        <label className="kg3d-auto">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(event) => {
              setAutoRotate(event.target.checked);
              dirtyRef.current = true;
            }}
          />
          自动旋转
        </label>
        <label className="kg3d-jump">
          <span>跳到术语</span>
          <select
            value={effectiveSelected}
            onChange={(event) => {
              setSelectedId(event.target.value);
              dirtyRef.current = true;
            }}
          >
            {nodes
              .filter((node) => activeIds.has(node.entry.id))
              .map((node) => (
                <option key={node.entry.id} value={node.entry.id}>
                  {node.entry.term}
                </option>
              ))}
          </select>
        </label>
      </div>

      <p className="kg-hint">
        拖动或使用旋转按钮改变视角；手机端点圆点选择术语，选中后会显示名称。键盘 Tab 可逐个查看节点。
      </p>

      <aside className="kg-detail" aria-live="polite">
        <div className="kg-detail__main">
          <div className="kg-detail__head">
            <span className="tag tag--accent">{selectedEntry.group}</span>
            <h3 className="kg-detail__title">{selectedEntry.term}</h3>
            {selectedEntry.aka.length > 0 ? (
              <p className="kg-detail__aka">{selectedEntry.aka.join(" / ")}</p>
            ) : null}
          </div>
          <p className="kg-detail__body">{selectedEntry.plain}</p>
          {selectedEntry.detail ? (
            <p className="kg-detail__body">{selectedEntry.detail}</p>
          ) : null}
          {selectedEntry.caution ? (
            <p className="kg-detail__caution">{selectedEntry.caution}</p>
          ) : null}
          {selectedEntry.sourceUrl ? (
            <SourceLine
              name={selectedEntry.sourceName}
              url={selectedEntry.sourceUrl}
              verifiedAt={selectedEntry.verifiedAt}
            />
          ) : (
            <p className="kg-detail__source">
              来源：{selectedEntry.sourceName} · 本站核对 {selectedEntry.verifiedAt}
            </p>
          )}
          <div className="btn-row">
            <Link className="btn btn--ghost btn--small" to={`/learn#term-${selectedEntry.id}`}>
              在术语表打开
            </Link>
            <button type="button" className="btn btn--primary btn--small" onClick={openAssistant}>
              问小助手
            </button>
          </div>
        </div>

        <div className="kg-detail__relations">
          <h4>相连概念</h4>
          {relations.length === 0 ? (
            <p className="kg-detail__source">这张图里暂时没有相连节点。</p>
          ) : (
            <ul className="plain-list plain-list--tight">
              {relations.map((relation) => (
                <li key={relation.id}>
                  <button
                    type="button"
                    className="kg-relation"
                    onClick={() => {
                      setSelectedId(relation.id);
                      dirtyRef.current = true;
                    }}
                  >
                    <span>{relation.entry.term}</span>
                    <small>{relation.label}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </section>
  );
}

function activePathGroupActive(group: GlossaryGroup, active: Set<string>): boolean {
  return glossaryEntries.some((entry) => entry.group === group && active.has(entry.id));
}
