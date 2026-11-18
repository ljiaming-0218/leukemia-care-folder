import type { KeyboardEvent } from "react";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import type { PatrolLevel } from "@/src/data/games/patrol";

type Phase = "playing" | "blocked" | "escaped";

type PatrolBoardProps = {
  level: PatrolLevel;
  whiteAt: string;
  germAt: string;
  phase: Phase;
  onMove: (id: string) => void;
  onNotice: (message: string) => void;
};

function position(x: number, y: number) {
  return { left: `${8 + (x / 4) * 84}%`, top: `${8 + (y / 3) * 84}%` };
}

function GermBlob() {
  return (
    <svg viewBox="0 0 48 48" width={30} height={30} aria-hidden="true" className="patrol-germ">
      <path
        d="M24 4l5 5 7-2 3 7 6 3-2 7 2 6-6 4-3 7-7-1-5 4-5-4-7 1-3-7-6-4 2-6-2-7 6-3 3-7 7 2z"
        className="patrol-germ__body"
      />
      <circle cx="18" cy="22" r="2.4" className="patrol-germ__eye" />
      <circle cx="30" cy="22" r="2.4" className="patrol-germ__eye" />
      <path d="M20 32q4-3 8 0" className="patrol-germ__mouth" />
    </svg>
  );
}

export function PatrolBoard({ level, whiteAt, germAt, phase, onMove, onNotice }: PatrolBoardProps) {
  const edges = level.edges;
  const nodeById = new Map(level.nodes.map((node) => [node.id, node]));
  const current = nodeById.get(whiteAt);
  const pathSet = new Set(level.germPath);
  const reachable = new Set(
    edges.flatMap(([a, b]) => (a === whiteAt ? [b] : b === whiteAt ? [a] : [])),
  );

  function pathPoints() {
    return level.germPath
      .map((id) => {
        const node = nodeById.get(id);
        return node ? `${8 + (node.x / 4) * 84},${8 + (node.y / 3) * 84}` : "";
      })
      .join(" ");
  }

  function arrowTarget(key: string) {
    if (!current) return null;
    const dirs: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const dir = dirs[key];
    if (!dir) return null;
    let best: { id: string; distance: number } | null = null;
    for (const id of reachable) {
      const node = nodeById.get(id);
      if (!node) continue;
      const vx = node.x - current.x;
      const vy = node.y - current.y;
      const forward = vx * dir[0] + vy * dir[1];
      const sideways = Math.abs(vx * dir[1] - vy * dir[0]);
      if (forward <= 0 || sideways > forward) continue;
      const distance = Math.abs(vx) + Math.abs(vy);
      if (!best || distance < best.distance) best = { id, distance };
    }
    return best?.id ?? null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (phase !== "playing") return;
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const target = arrowTarget(event.key);
    if (target) onMove(target);
    else onNotice("这个方向没有路，换一个方向试试。");
  }

  function handleNode(id: string) {
    if (phase !== "playing") return;
    if (id === whiteAt) return;
    if (reachable.has(id)) onMove(id);
    else onNotice("这个路口一步走不到。亮起来的路口才能走。");
  }

  return (
    <div
      className="patrol-board"
      role="group"
      tabIndex={0}
      aria-label="巡逻棋盘。按方向键移动白细胞，也可以按 Tab 到亮起来的路口。"
      onKeyDown={handleKeyDown}
    >
      <svg
        className="patrol-board__roads"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map(([a, b]) => {
          const from = nodeById.get(a);
          const to = nodeById.get(b);
          if (!from || !to) return null;
          return (
            <line
              key={`${a}-${b}`}
              x1={8 + (from.x / 4) * 84}
              y1={8 + (from.y / 3) * 84}
              x2={8 + (to.x / 4) * 84}
              y2={8 + (to.y / 3) * 84}
              className="patrol-road"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        <polyline
          points={pathPoints()}
          className="patrol-road patrol-road--germ"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {level.nodes.map((node) => {
        const isWhite = node.id === whiteAt;
        const isGerm = node.id === germAt;
        const canReach = reachable.has(node.id);
        const isExit = node.id === level.germPath[level.germPath.length - 1];
        const classes = [
          "patrol-node",
          pathSet.has(node.id) ? "is-path" : "",
          canReach && phase === "playing" ? "is-reachable" : "",
          isWhite ? "is-white" : "",
          isGerm ? "is-germ" : "",
          isExit ? "is-exit" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const label = [
          node.label,
          isWhite ? "白细胞在这里" : "",
          isGerm ? "病菌在这里" : "",
          canReach && phase === "playing" ? "可以走过去" : "",
        ]
          .filter(Boolean)
          .join("，");
        return (
          <button
            key={node.id}
            type="button"
            className={classes}
            style={position(node.x, node.y)}
            aria-label={label}
            aria-disabled={!canReach || phase !== "playing"}
            tabIndex={canReach && phase === "playing" ? 0 : -1}
            onClick={() => handleNode(node.id)}
          >
            {isWhite && <CellBuddy kind="white" size={32} title="" />}
            {isGerm && <GermBlob />}
            {!isWhite && !isGerm && <span className="patrol-node__dot" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
