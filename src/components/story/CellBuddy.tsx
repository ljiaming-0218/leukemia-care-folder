export type CellKind = "red" | "white" | "platelet" | "stem" | "blast";

const LABEL: Record<CellKind, string> = {
  red: "红细胞",
  white: "白细胞",
  platelet: "血小板",
  stem: "细胞宝宝",
  blast: "没长大的白血病细胞",
};

function Face({ cx, cy, scale = 1, mood = "happy" }: { cx: number; cy: number; scale?: number; mood?: "happy" | "worried" | "blank" }) {
  const eye = 3.4 * scale;
  const gap = 9 * scale;
  return (
    <g className="cell-face">
      <circle className="cell-eye" cx={cx - gap} cy={cy} r={eye} />
      <circle className="cell-eye" cx={cx + gap} cy={cy} r={eye} />
      <circle className="cell-shine" cx={cx - gap + eye * 0.36} cy={cy - eye * 0.36} r={eye * 0.4} />
      <circle className="cell-shine" cx={cx + gap + eye * 0.36} cy={cy - eye * 0.36} r={eye * 0.4} />
      {mood !== "blank" && (
        <>
          <ellipse className="cell-blush" cx={cx - gap - 5 * scale} cy={cy + 6 * scale} rx={4 * scale} ry={2.5 * scale} />
          <ellipse className="cell-blush" cx={cx + gap + 5 * scale} cy={cy + 6 * scale} rx={4 * scale} ry={2.5 * scale} />
        </>
      )}
      {mood === "happy" && (
        <path
          d={`M ${cx - 7 * scale} ${cy + 7 * scale} Q ${cx} ${cy + 14 * scale} ${cx + 7 * scale} ${cy + 7 * scale}`}
          className="cell-mouth"
        />
      )}
      {mood === "worried" && (
        <path
          d={`M ${cx - 6 * scale} ${cy + 12 * scale} Q ${cx} ${cy + 7 * scale} ${cx + 6 * scale} ${cy + 12 * scale}`}
          className="cell-mouth"
        />
      )}
      {mood === "blank" && (
        <line x1={cx - 5 * scale} y1={cy + 10 * scale} x2={cx + 5 * scale} y2={cy + 10 * scale} className="cell-mouth" />
      )}
    </g>
  );
}

export function CellBuddy({
  kind,
  size = 72,
  mood,
  title,
  className = "",
}: {
  kind: CellKind;
  size?: number;
  mood?: "happy" | "worried" | "blank";
  title?: string;
  className?: string;
}) {
  const label = title ?? LABEL[kind];
  const faceMood = mood ?? (kind === "blast" ? "blank" : "happy");
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`cell-buddy cell-buddy--${kind} ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {kind === "red" && (
        <>
          <ellipse cx="50" cy="52" rx="42" ry="36" className="cell-body" />
          <ellipse cx="50" cy="52" rx="24" ry="17" className="cell-dimple" />
          <Face cx={50} cy={48} mood={faceMood} />
        </>
      )}
      {kind === "white" && (
        <>
          <path
            d="M50 10c12 0 18 8 26 10s16 12 14 24 6 20-2 30-20 14-30 14-22-2-30-10-12-20-10-30 0-22 10-28 10-10 22-10z"
            className="cell-body"
          />
          <path d="M34 64c4-6 12-6 14 0s10 6 14 0 10-4 12 2" className="cell-nucleus-line" />
          <Face cx={50} cy={44} mood={faceMood} />
        </>
      )}
      {kind === "platelet" && (
        <>
          <path
            d="M30 34c8-12 30-14 40-4s18 18 8 30-30 18-42 10-14-24-6-36z"
            className="cell-body"
          />
          <circle cx="40" cy="62" r="3" className="cell-dot" />
          <circle cx="60" cy="64" r="2.5" className="cell-dot" />
          <circle cx="66" cy="36" r="2" className="cell-dot" />
          <Face cx={50} cy={46} scale={0.8} mood={faceMood} />
        </>
      )}
      {kind === "stem" && (
        <>
          <circle cx="50" cy="52" r="30" className="cell-body" />
          <circle cx="50" cy="52" r="16" className="cell-nucleus" />
          <Face cx={50} cy={50} scale={0.7} mood={faceMood} />
        </>
      )}
      {kind === "blast" && (
        <>
          <circle cx="50" cy="52" r="36" className="cell-body" />
          <circle cx="50" cy="52" r="28" className="cell-nucleus" />
          <Face cx={50} cy={50} scale={0.8} mood={faceMood} />
        </>
      )}
    </svg>
  );
}
