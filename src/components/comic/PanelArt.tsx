import type { ReactNode } from "react";
import type { ArtKey } from "@/src/data/comics/panels";

/* 统一画风：400×260 画布，圆角、低饱和、无真实医疗细节。
   针头、穿刺一律用「取样工具」「小盒子」等隐喻，不画血、不画伤口特写。 */

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 400 260" className="panel-art" role="img" aria-label={label}>
      <rect x="0" y="0" width="400" height="260" rx="18" className="ca-bg" />
      {children}
    </svg>
  );
}

function Face({ x, y, s = 1, mood = "happy" }: { x: number; y: number; s?: number; mood?: "happy" | "worried" | "sleepy" | "blank" }) {
  const eye = 3.2 * s;
  const gap = 8.5 * s;
  return (
    <g className="ca-face">
      {mood === "sleepy" ? (
        <>
          <path d={`M ${x - gap - eye} ${y} q ${eye} ${3 * s} ${eye * 2} 0`} className="ca-line-stroke" />
          <path d={`M ${x + gap - eye} ${y} q ${eye} ${3 * s} ${eye * 2} 0`} className="ca-line-stroke" />
        </>
      ) : (
        <>
          <circle cx={x - gap} cy={y} r={eye} className="ca-eye" />
          <circle cx={x + gap} cy={y} r={eye} className="ca-eye" />
          <circle cx={x - gap + eye * 0.36} cy={y - eye * 0.36} r={eye * 0.4} className="ca-eye-shine" />
          <circle cx={x + gap + eye * 0.36} cy={y - eye * 0.36} r={eye * 0.4} className="ca-eye-shine" />
        </>
      )}
      {(mood === "happy" || mood === "sleepy") && (
        <>
          <ellipse cx={x - gap - 4.5 * s} cy={y + 5.5 * s} rx={3.6 * s} ry={2.3 * s} className="ca-blush" />
          <ellipse cx={x + gap + 4.5 * s} cy={y + 5.5 * s} rx={3.6 * s} ry={2.3 * s} className="ca-blush" />
        </>
      )}
      {mood === "happy" && <path d={`M ${x - 7 * s} ${y + 7 * s} Q ${x} ${y + 13 * s} ${x + 7 * s} ${y + 7 * s}`} className="ca-line-stroke" />}
      {mood === "worried" && <path d={`M ${x - 6 * s} ${y + 11 * s} Q ${x} ${y + 6 * s} ${x + 6 * s} ${y + 11 * s}`} className="ca-line-stroke" />}
      {mood === "sleepy" && <circle cx={x} cy={y + 9 * s} r={3 * s} className="ca-eye" />}
      {mood === "blank" && <line x1={x - 5 * s} y1={y + 9 * s} x2={x + 5 * s} y2={y + 9 * s} className="ca-line-stroke" />}
    </g>
  );
}

function RedCell({ x, y, r = 30, mood = "happy", dim = false }: { x: number; y: number; r?: number; mood?: "happy" | "worried" | "sleepy" | "blank"; dim?: boolean }) {
  const k = r / 30;
  return (
    <g className={dim ? "ca-dim" : undefined}>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.86} className="ca-red" />
      <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.4} className="ca-red-dimple" />
      <Face x={x} y={y - 3 * k} s={k} mood={mood} />
    </g>
  );
}

function WhiteCell({ x, y, r = 30, mood = "happy", dim = false }: { x: number; y: number; r?: number; mood?: "happy" | "worried" | "sleepy" | "blank"; dim?: boolean }) {
  const k = r / 30;
  return (
    <g className={dim ? "ca-dim" : undefined}>
      <circle cx={x - r * 0.5} cy={y - r * 0.4} r={r * 0.62} className="ca-white" />
      <circle cx={x + r * 0.5} cy={y - r * 0.4} r={r * 0.62} className="ca-white" />
      <circle cx={x} cy={y + r * 0.3} r={r * 0.7} className="ca-white" />
      <circle cx={x} cy={y - r * 0.05} r={r * 0.72} className="ca-white" />
      <Face x={x} y={y - 2 * k} s={k} mood={mood} />
    </g>
  );
}

function Platelet({ x, y, r = 24, mood = "happy", dim = false }: { x: number; y: number; r?: number; mood?: "happy" | "worried" | "sleepy" | "blank"; dim?: boolean }) {
  const k = r / 24;
  return (
    <g className={dim ? "ca-dim" : undefined}>
      <path
        d={`M ${x - r * 0.9} ${y - r * 0.4} q ${r * 0.5} ${-r * 0.9} ${r * 1.3} ${-r * 0.4} t ${r * 0.4} ${r * 1.1} q ${-r * 0.7} ${r * 0.9} ${-r * 1.5} ${r * 0.3} t ${-r * 0.2} ${-r * 1}`}
        className="ca-platelet"
      />
      <circle cx={x - r * 0.3} cy={y + r * 0.35} r={2.4 * k} className="ca-platelet-dot" />
      <circle cx={x + r * 0.4} cy={y + r * 0.2} r={2 * k} className="ca-platelet-dot" />
      <Face x={x} y={y - 1 * k} s={0.8 * k} mood={mood} />
    </g>
  );
}

function StemCell({ x, y, r = 22, mood = "happy", dim = false }: { x: number; y: number; r?: number; mood?: "happy" | "worried" | "sleepy" | "blank"; dim?: boolean }) {
  const k = r / 22;
  return (
    <g className={dim ? "ca-dim" : undefined}>
      <circle cx={x} cy={y} r={r} className="ca-stem" />
      <circle cx={x} cy={y} r={r * 0.55} className="ca-stem-nucleus" />
      <Face x={x} y={y - 1 * k} s={0.72 * k} mood={mood} />
    </g>
  );
}

function BlastCell({ x, y, r = 22 }: { x: number; y: number; r?: number }) {
  const k = r / 22;
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="ca-blast" />
      <circle cx={x} cy={y} r={r * 0.66} className="ca-blast-nucleus" />
      <Face x={x} y={y - 1 * k} s={0.75 * k} mood="blank" />
    </g>
  );
}

function Germ({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="ca-germ" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1={x + Math.cos((angle * Math.PI) / 180) * r}
          y1={y + Math.sin((angle * Math.PI) / 180) * r}
          x2={x + Math.cos((angle * Math.PI) / 180) * (r + 5)}
          y2={y + Math.sin((angle * Math.PI) / 180) * (r + 5)}
          className="ca-germ-spine"
        />
      ))}
      <Face x={x} y={y - 1} s={0.55} mood="worried" />
    </g>
  );
}

function Kid({ x, y, s = 1, mood = "happy" }: { x: number; y: number; s?: number; mood?: "happy" | "worried" | "sleepy" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-16" y="4" width="32" height="38" rx="14" className="ca-kid-shirt" />
      <circle cx="0" cy="-16" r="19" className="ca-skin" />
      <path d="M -19 -20 q 4 -16 19 -16 t 19 16 q -6 -8 -19 -8 t -19 8" className="ca-hair" />
      <Face x={0} y={-14} s={0.95} mood={mood} />
    </g>
  );
}

function Adult({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-19" y="6" width="38" height="46" rx="15" className="ca-adult-shirt" />
      <circle cx="0" cy="-18" r="20" className="ca-skin" />
      <path d="M -20 -22 q 5 -15 20 -15 t 20 15 q -7 -7 -20 -7 t -20 7" className="ca-hair" />
      <Face x={0} y={-16} s={1} />
    </g>
  );
}

function Doctor({ x, y, s = 1, hat = false }: { x: number; y: number; s?: number; hat?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-19" y="6" width="38" height="46" rx="15" className="ca-coat" />
      <rect x="-6" y="14" width="12" height="30" rx="5" className="ca-coat-line" />
      <circle cx="0" cy="-18" r="20" className="ca-skin" />
      <path d="M -20 -22 q 5 -15 20 -15 t 20 15 q -7 -7 -20 -7 t -20 7" className="ca-hair" />
      {hat && <path d="M -22 -30 q 22 -14 44 0 l -6 -4 q -16 -9 -32 0 z" className="ca-hat" />}
      <Face x={0} y={-16} s={1} />
      <g transform="translate(14 20)">
        <rect x="-3" y="-8" width="6" height="16" rx="2" className="ca-cross" />
        <rect x="-8" y="-3" width="16" height="6" rx="2" className="ca-cross" />
      </g>
    </g>
  );
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M ${x} ${y - 7 * s} L ${x + 2 * s} ${y - 2 * s} L ${x + 7 * s} ${y} L ${x + 2 * s} ${y + 2 * s} L ${x} ${y + 7 * s} L ${x - 2 * s} ${y + 2 * s} L ${x - 7 * s} ${y} L ${x - 2 * s} ${y - 2 * s} Z`}
      className="ca-sparkle"
    />
  );
}

function Heart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M ${x} ${y + 7 * s} C ${x - 10 * s} ${y - 2 * s}, ${x - 4 * s} ${y - 10 * s}, ${x} ${y - 4 * s} C ${x + 4 * s} ${y - 10 * s}, ${x + 10 * s} ${y - 2 * s}, ${x} ${y + 7 * s} Z`}
      className="ca-heart"
    />
  );
}

function VesselBand({ y = 130, h = 92 }: { y?: number; h?: number }) {
  return (
    <>
      <rect x="-10" y={y} width="420" height={h} rx={h / 2} className="ca-vessel" />
      <rect x="-10" y={y + 8} width="420" height={h - 24} rx={(h - 24) / 2} className="ca-vessel-inner" />
    </>
  );
}

function FactoryRoof() {
  return (
    <>
      <rect x="40" y="70" width="320" height="150" rx="16" className="ca-factory" />
      <path d="M 40 70 L 80 34 L 130 70 L 170 34 L 220 70 L 260 34 L 310 70 L 360 34 L 360 70 Z" className="ca-factory-roof" />
      <rect x="60" y="20" width="16" height="30" rx="6" className="ca-factory-chimney" />
    </>
  );
}

function SpeechTag({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={text.length * 15 + 24} height="34" rx="16" className="ca-tag" />
      <text x={x + 12} y={y + 22} className="ca-tag-text">
        {text}
      </text>
    </g>
  );
}

const ART: Record<ArtKey, () => ReactNode> = {
  /* ── 第 1 章 ── */
  "helpers-intro": () => (
    <>
      <Sparkle x={60} y={50} s={1.2} />
      <Sparkle x={345} y={60} />
      <Sparkle x={200} y={36} s={0.8} />
      <RedCell x={110} y={150} r={44} />
      <WhiteCell x={205} y={140} r={44} />
      <Platelet x={295} y={155} r={36} />
    </>
  ),
  "vessel-road": () => (
    <>
      <VesselBand y={84} h={100} />
      <g className="ca-flow">
        <RedCell x={60} y={134} r={24} />
        <WhiteCell x={150} y={128} r={22} />
        <Platelet x={225} y={140} r={18} />
        <RedCell x={300} y={130} r={24} />
        <RedCell x={365} y={140} r={18} />
      </g>
      <SpeechTag x={110} y={205} text="血管公路" />
    </>
  ),
  "red-intro": () => (
    <>
      <Sparkle x={320} y={60} />
      <RedCell x={170} y={135} r={72} />
      <circle cx={268} cy={92} r={24} className="ca-oxygen" />
      <text x={256} y={99} className="ca-oxygen-text">
        O₂
      </text>
      <path d="M 240 108 q 8 10 -2 20" className="ca-line-stroke" />
    </>
  ),
  "white-intro": () => (
    <>
      <Germ x={310} y={130} r={26} />
      <WhiteCell x={150} y={135} r={58} />
      <path d="M 232 96 l 30 12 l 0 44 l -30 12 z" className="ca-shield" />
      <path d="M 247 108 l 0 44" className="ca-shield-line" />
    </>
  ),
  "platelet-intro": () => (
    <>
      <path d="M 60 190 Q 150 160 240 186 T 380 178" className="ca-crack" />
      <Platelet x={200} y={120} r={46} />
      <rect x="164" y="164" width="72" height="30" rx="10" className="ca-patch" transform="rotate(-6 200 179)" />
      <Sparkle x={300} y={80} s={0.9} />
    </>
  ),
  "helpers-team": () => (
    <>
      <VesselBand y={70} h={120} />
      <g className="ca-float-slow">
        <RedCell x={85} y={120} r={30} />
        <rect x="60" y="150" width="50" height="26" rx="8" className="ca-box" />
        <WhiteCell x={205} y={115} r={28} />
        <circle cx={248} cy={92} r={13} className="ca-lens" />
        <line x1={257} y1={101} x2={270} y2={114} className="ca-lens-handle" />
        <Platelet x={320} y={135} r={26} />
        <rect x="298" y="160" width="46" height="20" rx="8" className="ca-patch" />
      </g>
      <Sparkle x={150} y={215} s={0.8} />
      <Sparkle x={300} y={212} s={0.9} />
    </>
  ),
  "blood-test": () => (
    <>
      <Doctor x={105} y={140} s={1.25} />
      <rect x="205" y="80" width="84" height="108" rx="10" className="ca-clipboard" />
      <line x1="220" y1="106" x2="274" y2="106" className="ca-clip-line" />
      <line x1="220" y1="128" x2="274" y2="128" className="ca-clip-line" />
      <line x1="220" y1="150" x2="262" y2="150" className="ca-clip-line" />
      <rect x="312" y="96" width="24" height="86" rx="12" className="ca-tube" />
      <rect x="312" y="150" width="24" height="32" rx="12" className="ca-tube-fill" />
      <circle cx={324} cy={90} r={9} className="ca-tube-cap" />
      <SpeechTag x={185} y={208} text="血常规" />
    </>
  ),
  "helpers-low": () => (
    <>
      <RedCell x={70} y={70} r={18} dim mood="worried" />
      <WhiteCell x={330} y={64} r={17} dim mood="worried" />
      <Platelet x={300} y={215} r={14} dim mood="worried" />
      <Kid x={200} y={150} s={1.5} mood="sleepy" />
      <text x={248} y={88} className="ca-zzz">
        z z
      </text>
    </>
  ),
  "helpers-remember": () => (
    <>
      <g className="ca-pulse-group">
        <RedCell x={200} y={68} r={30} />
        <WhiteCell x={108} y={182} r={30} />
        <Platelet x={292} y={182} r={26} />
        <path d="M 178 92 Q 140 128 122 156" className="ca-hand-line" />
        <path d="M 222 92 Q 262 128 280 158" className="ca-hand-line" />
        <path d="M 140 196 Q 200 214 262 196" className="ca-hand-line" />
        <Sparkle x={200} y={148} s={1.5} />
      </g>
    </>
  ),

  /* ── 第 3 章 ── */
  "mischief-intro": () => (
    <>
      <FactoryRoof />
      <rect x="160" y="130" width="80" height="90" rx="10" className="ca-door" />
      <path d="M 160 130 L 214 130 L 214 220 L 160 220 Z" className="ca-door-open" />
      <path d="M 214 140 L 250 128 L 250 226 L 214 214 Z" className="ca-door-light" />
      <SpeechTag x={118} y={44} text="骨髓工厂" />
    </>
  ),
  "factory-busy": () => (
    <>
      <FactoryRoof />
      <rect x="64" y="168" width="272" height="16" rx="8" className="ca-belt" />
      <StemCell x={110} y={146} r={17} />
      <StemCell x={185} y={142} r={22} />
      <RedCell x={272} y={140} r={24} />
      <path d="M 316 150 q 20 6 26 22" className="ca-line-stroke" />
      <Sparkle x={272} y={96} s={0.9} />
    </>
  ),
  "cell-mistake": () => (
    <>
      <circle cx="200" cy="140" r="66" className="ca-stem" />
      <circle cx="200" cy="140" r="40" className="ca-stem-nucleus" />
      <Face x={200} y={136} s={1.4} mood="worried" />
      <path d="M 268 140 a 34 34 0 1 1 -24 -56" className="ca-divide" />
      <text x="186" y="52" className="ca-question">
        ?
      </text>
    </>
  ),
  "blast-multiply": () => (
    <>
      <BlastCell x={80} y={130} r={30} />
      <BlastCell x={160} y={130} r={30} />
      <BlastCell x={240} y={130} r={30} />
      <BlastCell x={320} y={130} r={30} />
      <text x={106} y={130} className="ca-equals">
        =
      </text>
      <text x={186} y={130} className="ca-equals">
        =
      </text>
      <text x={266} y={130} className="ca-equals">
        =
      </text>
      <SpeechTag x={92} y={196} text="都没长大" />
    </>
  ),
  "factory-crowded": () => (
    <>
      <FactoryRoof />
      <BlastCell x={92} y={110} r={19} />
      <BlastCell x={138} y={102} r={19} />
      <BlastCell x={184} y={112} r={19} />
      <BlastCell x={230} y={100} r={19} />
      <BlastCell x={276} y={112} r={19} />
      <BlastCell x={322} y={104} r={19} />
      <BlastCell x={115} y={152} r={19} />
      <BlastCell x={161} y={158} r={19} />
      <BlastCell x={207} y={150} r={19} />
      <BlastCell x={253} y={158} r={19} />
      <BlastCell x={299} y={150} r={19} />
      <StemCell x={78} y={198} r={14} mood="worried" />
      <RedCell x={330} y={198} r={14} mood="worried" />
    </>
  ),
  "tired-red": () => (
    <>
      <RedCell x={80} y={80} r={22} dim mood="sleepy" />
      <RedCell x={330} y={70} r={16} dim mood="sleepy" />
      <rect x="150" y="170" width="110" height="16" rx="8" className="ca-chair" />
      <rect x="150" y="120" width="16" height="66" rx="8" className="ca-chair" />
      <Kid x={210} y={140} s={1.35} mood="sleepy" />
      <text x={252} y={98} className="ca-zzz">
        z z z
      </text>
    </>
  ),
  "bruise-platelet": () => (
    <>
      <Platelet x={90} y={80} r={22} dim mood="worried" />
      <Kid x={200} y={120} s={1.4} mood="worried" />
      <rect x="176" y="196" width="20" height="52" rx="10" className="ca-skin" />
      <rect x="206" y="196" width="20" height="52" rx="10" className="ca-skin" />
      <ellipse cx="188" cy="218" rx="11" ry="8" className="ca-bruise" />
      <Sparkle x={320} y={110} s={0.8} />
    </>
  ),
  "fever-white": () => (
    <>
      <WhiteCell x={330} y={70} r={20} dim mood="worried" />
      <rect x="60" y="150" width="220" height="70" rx="18" className="ca-bed" />
      <rect x="60" y="128" width="70" height="42" rx="14" className="ca-pillow" />
      <circle cx="104" cy="146" r="20" className="ca-skin" />
      <Face x={104} y={148} s={0.9} mood="sleepy" />
      <rect x="86" y="126" width="36" height="12" rx="6" className="ca-coolpad" />
      <Adult x={322} y={150} s={1.05} />
    </>
  ),
  "not-your-fault": () => (
    <>
      <Heart x={90} y={60} s={1.3} />
      <Heart x={310} y={52} s={1} />
      <Heart x={330} y={110} s={0.8} />
      <Heart x={70} y={120} s={0.8} />
      <Adult x={170} y={150} s={1.3} />
      <Kid x={228} y={168} s={1.15} />
      <path d="M 140 150 q -14 34 6 56" className="ca-hug-arm" />
      <path d="M 202 140 q 40 -6 62 16" className="ca-hug-arm" />
    </>
  ),
  "not-catching": () => (
    <>
      <Sparkle x={200} y={48} s={1.1} />
      <Kid x={130} y={140} s={1.3} />
      <Kid x={270} y={140} s={1.3} />
      <path d="M 156 152 Q 200 168 244 152" className="ca-hand-line" />
      <circle cx="200" cy="205" r="18" className="ca-ball" />
      <path d="M 186 198 q 14 8 28 0 M 186 212 q 14 -8 28 0" className="ca-ball-line" />
    </>
  ),

  /* ── 第 4 章 ── */
  "detective-intro": () => (
    <>
      <rect x="110" y="30" width="180" height="44" rx="12" className="ca-signboard" />
      <text x={200} y={58} className="ca-signboard-text" textAnchor="middle">
        侦探工具
      </text>
      <rect x="60" y="150" width="280" height="16" rx="8" className="ca-desk" />
      <circle cx="130" cy="126" r="17" className="ca-lens" />
      <line x1="142" y1="138" x2="158" y2="154" className="ca-lens-handle" />
      <rect x="210" y="106" width="60" height="44" rx="6" className="ca-folder" />
      <line x1="220" y1="120" x2="260" y2="120" className="ca-clip-line" />
      <line x1="220" y1="134" x2="252" y2="134" className="ca-clip-line" />
      <Sparkle x={320} y={100} s={0.9} />
    </>
  ),
  "detective-doctor": () => (
    <>
      <Doctor x={140} y={130} s={1.4} hat />
      <circle cx="250" cy="120" r="26" className="ca-lens" />
      <line x1="268" y1="138" x2="290" y2="160" className="ca-lens-handle" />
      <ellipse cx="252" cy="122" rx="9" ry="6" className="ca-lens-gleam" />
      <ellipse cx="300" cy="210" rx="14" ry="6" className="ca-footprint" />
      <ellipse cx="336" cy="222" rx="14" ry="6" className="ca-footprint" />
    </>
  ),
  "blood-draw": () => (
    <>
      <Doctor x={110} y={140} s={1.25} />
      <rect x="230" y="80" width="30" height="110" rx="15" className="ca-tube" />
      <rect x="230" y="150" width="30" height="40" rx="15" className="ca-tube-fill" />
      <circle cx={245} cy={74} r={11} className="ca-tube-cap" />
      <SpeechTag x={216} y={212} text="只取一点点" />
      <Sparkle x={310} y={90} s={1} />
    </>
  ),
  "marrow-pick": () => (
    <>
      <rect x="70" y="96" width="130" height="70" rx="34" className="ca-bone" />
      <circle cx="104" cy="122" r="6" className="ca-bone-dot" />
      <circle cx="134" cy="140" r="6" className="ca-bone-dot" />
      <circle cx="164" cy="118" r="6" className="ca-bone-dot" />
      <path d="M 206 128 q 34 -14 52 -6" className="ca-probe" />
      <circle cx="262" cy="120" r="9" className="ca-probe-tip" />
      <rect x="240" y="160" width="96" height="58" rx="10" className="ca-sample-box" />
      <StemCell x={266} y={188} r={13} />
      <StemCell x={296} y={192} r={11} />
      <StemCell x={318} y={184} r={12} />
      <path d="M 262 132 q 6 16 -2 26" className="ca-line-stroke" />
    </>
  ),
  "sleep-medicine": () => (
    <>
      <circle cx="330" cy="56" r="22" className="ca-moon" />
      <circle cx="322" cy="50" r="18" className="ca-bg" />
      <rect x="70" y="140" width="230" height="74" rx="20" className="ca-bed" />
      <rect x="70" y="118" width="72" height="44" rx="14" className="ca-pillow" />
      <circle cx="114" cy="136" r="21" className="ca-skin" />
      <Face x={114} y={138} s={0.95} mood="sleepy" />
      <text x={150} y={112} className="ca-zzz">
        z z z
      </text>
      <g className="ca-float-slow">
        <circle cx="210" cy="80" r="14" className="ca-bubble" />
        <circle cx="248" cy="62" r="9" className="ca-bubble" />
        <circle cx="276" cy="88" r="6" className="ca-bubble" />
      </g>
    </>
  ),
  "marrow-refill": () => (
    <>
      <rect x="70" y="80" width="260" height="110" rx="20" className="ca-factory" />
      <path d="M 150 190 q 20 -26 40 0" className="ca-gap" />
      <StemCell x={158} y={168} r={13} />
      <StemCell x={184} y={174} r={11} />
      <StemCell x={204} y={164} r={12} />
      <path d="M 232 128 q 26 -12 44 4" className="ca-line-stroke" />
      <Sparkle x={120} y={116} s={0.9} />
      <Sparkle x={280} y={108} s={1.1} />
      <SpeechTag x={122} y={208} text="很快就补回来" />
    </>
  ),
  "lumbar-pick": () => (
    <>
      <rect x="90" y="40" width="150" height="184" rx="40" className="ca-body-outline" />
      <circle cx="165" cy="72" r="24" className="ca-brain" />
      <path d="M 165 96 L 165 196" className="ca-spine" />
      <circle cx="165" cy="182" r="9" className="ca-sample-dot" />
      <path d="M 178 186 q 40 6 58 -8" className="ca-probe" />
      <circle cx="240" cy="176" r="8" className="ca-probe-tip" />
      <rect x="268" y="90" width="72" height="52" rx="10" className="ca-sample-box" />
      <circle cx="304" cy="116" r="12" className="ca-sample-dot" />
      <SpeechTag x={252} y={166} text="一小份样本" />
    </>
  ),
  "lumbar-medicine": () => (
    <>
      <rect x="90" y="40" width="120" height="184" rx="40" className="ca-body-outline" />
      <circle cx="150" cy="72" r="22" className="ca-brain" />
      <path d="M 150 96 L 150 196" className="ca-spine" />
      <g className="ca-flow">
        <rect x="138" y="140" width="24" height="20" rx="7" className="ca-med-pack" />
        <path d="M 145 150 h 10 M 150 145 v 10" className="ca-med-cross" />
      </g>
      <Doctor x={290} y={140} s={1.2} />
      <path d="M 258 150 q -60 -6 -96 -8" className="ca-line-stroke" />
    </>
  ),
  "sample-labs": () => (
    <>
      <rect x="30" y="110" width="56" height="44" rx="10" className="ca-sample-box" />
      <StemCell x={58} y={132} r={13} />
      <path d="M 92 124 Q 150 90 208 74 M 92 132 L 208 132 M 92 140 Q 150 176 208 190" className="ca-belt-path" />
      <g>
        <rect x="216" y="46" width="120" height="52" rx="12" className="ca-lab" />
        <text x={276} y={78} className="ca-lab-text" textAnchor="middle">
          看样子
        </text>
      </g>
      <g>
        <rect x="216" y="108" width="120" height="52" rx="12" className="ca-lab" />
        <text x={276} y={140} className="ca-lab-text" textAnchor="middle">
          认身份证
        </text>
      </g>
      <g>
        <rect x="216" y="170" width="120" height="52" rx="12" className="ca-lab" />
        <text x={276} y={202} className="ca-lab-text" textAnchor="middle">
          查图纸
        </text>
      </g>
    </>
  ),
  "brave-hands": () => (
    <>
      <path d="M 80 200 q 10 -70 60 -76 q 26 -3 30 16 q 3 18 -22 22 l -30 5" className="ca-hand-kid" />
      <path d="M 330 208 q -12 -78 -68 -84 q -28 -3 -32 18 q -3 20 24 24 l 34 5" className="ca-hand-adult" />
      <Sparkle x={200} y={70} s={1.4} />
      <Sparkle x={120} y={96} s={0.8} />
      <Sparkle x={280} y={92} s={0.9} />
      <Heart x={200} y={170} s={1.1} />
    </>
  ),
  "detective-remember": () => (
    <>
      <circle cx="200" cy="90" r="42" className="ca-lens" />
      <circle cx="200" cy="90" r="32" className="ca-report" />
      <Face x={200} y={88} s={1.3} mood="happy" />
      <line x1="230" y1="120" x2="252" y2="142" className="ca-lens-handle" />
      <Doctor x={110} y={180} s={1.05} />
      <Kid x={290} y={184} s={1.05} />
      <path d="M 142 176 Q 200 158 258 176" className="ca-hand-line" />
      <Sparkle x={200} y={152} s={1} />
    </>
  ),

  /* ── 第 2 章 ── */
  "marrow-intro": () => (
    <>
      <rect x="50" y="76" width="300" height="112" rx="52" className="ca-bone" />
      <circle cx="72" cy="76" r="30" className="ca-bone" />
      <circle cx="72" cy="188" r="30" className="ca-bone" />
      <circle cx="328" cy="76" r="30" className="ca-bone" />
      <circle cx="328" cy="188" r="30" className="ca-bone" />
      <rect x="140" y="98" width="120" height="72" rx="10" className="ca-factory" />
      <path d="M 140 98 L 165 80 L 190 98 L 215 80 L 240 98 L 260 80 L 260 98 Z" className="ca-factory-roof" />
      <rect x="184" y="128" width="32" height="42" rx="6" className="ca-door" />
      <path d="M 200 132 L 228 124 L 228 174 L 200 166 Z" className="ca-door-light" />
      <Sparkle x={104} y={48} s={1} />
      <SpeechTag x={140} y={212} text="骨髓工厂" />
    </>
  ),
  "bone-inside": () => (
    <>
      <rect x="60" y="72" width="280" height="116" rx="54" className="ca-bone" />
      <circle cx="82" cy="72" r="28" className="ca-bone" />
      <circle cx="82" cy="188" r="28" className="ca-bone" />
      <circle cx="318" cy="72" r="28" className="ca-bone" />
      <circle cx="318" cy="188" r="28" className="ca-bone" />
      <rect x="102" y="98" width="196" height="64" rx="30" className="ca-factory" />
      <circle cx="140" cy="120" r="7" className="ca-bone-dot" />
      <circle cx="200" cy="140" r="7" className="ca-bone-dot" />
      <circle cx="258" cy="118" r="7" className="ca-bone-dot" />
      <SpeechTag x={136} y={206} text="软软像海绵" />
    </>
  ),
  "marrow-sponge": () => (
    <>
      <rect x="70" y="58" width="260" height="144" rx="46" className="ca-factory" />
      <circle cx="118" cy="96" r="10" className="ca-bone-dot" />
      <circle cx="298" cy="88" r="10" className="ca-bone-dot" />
      <circle cx="282" cy="172" r="10" className="ca-bone-dot" />
      <circle cx="108" cy="168" r="10" className="ca-bone-dot" />
      <g className="ca-float-slow">
        <StemCell x={162} y={128} r={26} />
        <StemCell x={232} y={118} r={22} />
      </g>
      <Sparkle x={200} y={52} s={0.9} />
    </>
  ),
  "stem-babies": () => (
    <>
      <StemCell x={200} y={108} r={54} />
      <g className="ca-float-slow">
        <StemCell x={92} y={192} r={22} />
        <StemCell x={162} y={206} r={18} />
        <StemCell x={240} y={206} r={18} />
        <StemCell x={310} y={192} r={22} />
      </g>
      <Sparkle x={302} y={58} s={1.1} />
      <Sparkle x={98} y={68} s={0.8} />
    </>
  ),
  "cell-growing": () => (
    <>
      <rect x="40" y="172" width="320" height="16" rx="8" className="ca-belt" />
      <StemCell x={90} y={148} r={15} />
      <StemCell x={170} y={140} r={21} />
      <StemCell x={250} y={132} r={26} />
      <RedCell x={330} y={132} r={24} />
      <path d="M 114 146 l 26 -4 M 198 140 l 24 -4 M 282 132 l 22 -2" className="ca-line-stroke" />
      <Sparkle x={330} y={88} s={1} />
    </>
  ),
  "cells-shipout": () => (
    <>
      <rect x="40" y="60" width="170" height="150" rx="14" className="ca-factory" />
      <path d="M 40 60 L 70 36 L 100 60 L 130 36 L 160 60 L 210 36 L 210 60 Z" className="ca-factory-roof" />
      <rect x="90" y="120" width="70" height="90" rx="8" className="ca-door" />
      <path d="M 90 120 L 130 120 L 130 210 L 90 210 Z" className="ca-door-open" />
      <path d="M 130 130 L 160 120 L 160 216 L 130 206 Z" className="ca-door-light" />
      <g className="ca-flow">
        <RedCell x={252} y={108} r={24} />
        <WhiteCell x={304} y={158} r={22} />
        <Platelet x={252} y={200} r={18} />
      </g>
      <Sparkle x={344} y={78} s={0.9} />
    </>
  ),
  "marrow-dive": () => (
    <>
      <FactoryRoof />
      <circle cx="200" cy="140" r="34" className="ca-lens" />
      <ellipse cx="190" cy="132" rx="10" ry="7" className="ca-lens-gleam" />
      <line x1="224" y1="164" x2="248" y2="188" className="ca-lens-handle" />
      <g className="ca-float-slow">
        <StemCell x={108} y={172} r={16} />
        <StemCell x={292} y={166} r={16} />
      </g>
      <Sparkle x={150} y={92} s={0.9} />
      <Sparkle x={262} y={96} s={1} />
    </>
  ),
  "marrow-remember": () => (
    <g className="ca-pulse-group">
      <rect x="140" y="56" width="120" height="72" rx="32" className="ca-bone" />
      <rect x="170" y="74" width="60" height="40" rx="8" className="ca-factory" />
      <path d="M 170 74 L 185 64 L 200 74 L 215 64 L 230 74 Z" className="ca-factory-roof" />
      <RedCell x={200} y={188} r={26} />
      <WhiteCell x={110} y={178} r={24} />
      <Platelet x={290} y={184} r={20} />
      <Sparkle x={200} y={148} s={1.3} />
    </g>
  ),

  /* ── 第 5 章 ── */
  "marathon-intro": () => (
    <>
      <path d="M 40 212 Q 140 182 200 152 T 372 92" className="ca-belt-path" />
      <Kid x={92} y={178} s={1.2} />
      <line x1="322" y1="58" x2="322" y2="108" className="ca-line-stroke" />
      <path d="M 322 58 l 42 13 l -42 13 z" className="ca-flag" />
      <Sparkle x={200} y={58} s={1} />
    </>
  ),
  "chemo-chase": () => (
    <>
      <g className="ca-flow">
        <rect x="58" y="98" width="72" height="58" rx="14" className="ca-med-pack" />
        <Face x={94} y={120} s={0.7} mood="happy" />
        <path d="M 86 144 h 16 M 94 136 v 16" className="ca-med-cross" />
      </g>
      <path d="M 140 128 q 30 -8 56 -6" className="ca-line-stroke" />
      <BlastCell x={232} y={120} r={24} />
      <BlastCell x={302} y={142} r={20} />
      <BlastCell x={352} y={108} r={16} />
      <Sparkle x={182} y={78} s={0.9} />
    </>
  ),
  "track-three": () => (
    <>
      <rect x="30" y="120" width="110" height="46" rx="22" className="ca-vessel" />
      <rect x="145" y="120" width="110" height="46" rx="22" className="ca-moon" />
      <rect x="260" y="120" width="110" height="46" rx="22" className="ca-crown-2" />
      <text x={85} y={150} className="ca-tag-text" textAnchor="middle">
        诱导
      </text>
      <text x={200} y={150} className="ca-tag-text" textAnchor="middle">
        巩固
      </text>
      <text x={315} y={150} className="ca-tag-text" textAnchor="middle">
        维持
      </text>
      <line x1="85" y1="70" x2="85" y2="112" className="ca-line-stroke" />
      <path d="M 85 70 l 34 10 l -34 10 z" className="ca-flag" />
      <line x1="200" y1="70" x2="200" y2="112" className="ca-line-stroke" />
      <path d="M 200 70 l 34 10 l -34 10 z" className="ca-flag" />
      <line x1="315" y1="70" x2="315" y2="112" className="ca-line-stroke" />
      <path d="M 315 70 l 34 10 l -34 10 z" className="ca-flag" />
    </>
  ),
  "stage-induction": () => (
    <>
      <rect x="40" y="150" width="320" height="44" rx="22" className="ca-vessel" />
      <line x1="80" y1="72" x2="80" y2="142" className="ca-line-stroke" />
      <path d="M 80 72 l 46 14 l -46 14 z" className="ca-flag" />
      <WhiteCell x={152} y={104} r={26} />
      <g className="ca-flow">
        <BlastCell x={252} y={108} r={20} />
        <BlastCell x={320} y={96} r={16} />
        <BlastCell x={366} y={118} r={13} />
      </g>
      <Sparkle x={204} y={58} s={1} />
    </>
  ),
  "stage-consolidation": () => (
    <>
      <rect x="40" y="152" width="320" height="40" rx="20" className="ca-moon" />
      <WhiteCell x={130} y={112} r={30} />
      <WhiteCell x={212} y={102} r={26} />
      <BlastCell x={312} y={116} r={16} />
      <path d="M 242 110 q 30 4 50 8" className="ca-line-stroke" />
      <Sparkle x={272} y={78} s={1.1} />
      <Sparkle x={170} y={58} s={0.8} />
    </>
  ),
  "stage-maintenance": () => (
    <>
      <rect x="60" y="92" width="170" height="118" rx="12" className="ca-factory" />
      <path d="M 46 94 L 145 38 L 244 94 Z" className="ca-factory-roof" />
      <rect x="120" y="140" width="50" height="70" rx="8" className="ca-door" />
      <rect x="268" y="78" width="82" height="98" rx="10" className="ca-clipboard" />
      <line x1="282" y1="104" x2="336" y2="104" className="ca-clip-line" />
      <line x1="282" y1="126" x2="336" y2="126" className="ca-clip-line" />
      <circle cx="296" cy="152" r="6" className="ca-cross" />
      <SpeechTag x={252} y={196} text="按时吃药" />
    </>
  ),
  "marathon-dive": () => (
    <>
      <path d="M 30 202 Q 130 172 200 142 T 380 82" className="ca-belt-path" />
      <path d="M 240 122 L 282 68 L 324 122 Z" className="ca-crown-2" />
      <g className="ca-float-slow">
        <circle cx="100" cy="62" r="22" className="ca-heart" />
        <path d="M 100 84 q 4 18 -2 30" className="ca-line-stroke" />
      </g>
      <RedCell x={162} y={172} r={18} />
      <WhiteCell x={332} y={152} r={18} />
      <Sparkle x={262} y={40} s={1} />
    </>
  ),
  "hair-falls": () => (
    <>
      <Kid x={150} y={142} s={1.5} mood="happy" />
      <g className="ca-float-slow">
        <path d="M 246 66 q 8 10 2 22" className="ca-hair-tuft" />
        <path d="M 282 92 q 8 10 2 22" className="ca-hair-tuft" />
        <path d="M 118 58 q 8 10 2 22" className="ca-hair-tuft" />
      </g>
      <circle cx="312" cy="172" r="34" className="ca-peach" />
      <path d="M 312 138 q 4 -10 14 -12" className="ca-hair-tuft" />
      <circle cx="296" cy="160" r="2.6" className="ca-bone-dot" />
      <circle cx="322" cy="152" r="2.6" className="ca-bone-dot" />
      <circle cx="306" cy="186" r="2.6" className="ca-bone-dot" />
      <Sparkle x={228} y={150} s={0.9} />
    </>
  ),
  "picc-line": () => (
    <>
      <rect x="60" y="108" width="280" height="48" rx="24" className="ca-skin" />
      <path d="M 82 128 Q 180 116 322 130" className="ca-picc" />
      <circle cx="150" cy="122" r="13" className="ca-patch" />
      <Sparkle x={252} y={78} s={0.9} />
      <SpeechTag x={196} y={188} text="软软的小管子" />
    </>
  ),
  "marathon-remember": () => (
    <g className="ca-pulse-group">
      <path d="M 40 212 Q 200 182 360 202" className="ca-belt-path" />
      <Adult x={150} y={140} s={1.15} />
      <Kid x={240} y={152} s={1.15} />
      <path d="M 178 150 Q 205 162 226 152" className="ca-hand-line" />
      <line x1="322" y1="58" x2="322" y2="108" className="ca-line-stroke" />
      <path d="M 322 58 l 42 13 l -42 13 z" className="ca-flag" />
      <Sparkle x={108} y={68} s={1} />
    </g>
  ),

  /* ── 第 6 章 ── */
  "shield-intro": () => (
    <>
      <WhiteCell x={110} y={130} r={52} />
      <path d="M 250 58 L 340 88 L 340 148 Q 340 208 250 234 Q 160 208 160 148 L 160 88 Z" className="ca-shield" />
      <path d="M 250 92 L 250 198" className="ca-shield-line" />
      <Sparkle x={330} y={44} s={1} />
    </>
  ),
  "germs-sneak": () => (
    <>
      <WhiteCell x={180} y={118} r={34} dim mood="worried" />
      <WhiteCell x={252} y={150} r={26} dim mood="worried" />
      <Germ x={62} y={198} r={20} />
      <Germ x={338} y={68} r={18} />
      <Germ x={348} y={198} r={15} />
    </>
  ),
  "wash-hands": () => (
    <>
      <path d="M 70 58 h 70 q 18 0 18 18 v 20" className="ca-probe" />
      <path d="M 158 104 v 26" className="ca-picc" />
      <rect x="118" y="150" width="92" height="42" rx="21" className="ca-skin" />
      <g className="ca-float-slow">
        <circle cx="140" cy="128" r="10" className="ca-bubble" />
        <circle cx="182" cy="116" r="13" className="ca-bubble" />
        <circle cx="222" cy="130" r="9" className="ca-bubble" />
        <circle cx="252" cy="110" r="7" className="ca-bubble" />
      </g>
      <Germ x={322} y={188} r={16} />
      <Sparkle x={100} y={92} s={0.9} />
    </>
  ),
  "mask-on": () => (
    <>
      <Kid x={170} y={130} s={1.8} />
      <rect x="142" y="108" width="56" height="30" rx="13" className="ca-mask" />
      <path d="M 142 116 q -10 6 -4 16 M 198 116 q 10 6 4 16" className="ca-line-stroke" />
      <path d="M 238 120 L 300 120" className="ca-gap" />
      <Germ x={332} y={120} r={18} />
    </>
  ),
  "food-safe": () => (
    <>
      <path d="M 100 150 L 260 150 Q 250 214 180 214 Q 110 214 100 150 Z" className="ca-bowl" />
      <ellipse cx="180" cy="146" rx="78" ry="16" className="ca-pillow" />
      <path d="M 150 116 q 8 -16 0 -30 M 180 110 q 8 -16 0 -30 M 210 116 q 8 -16 0 -30" className="ca-steam" />
      <rect x="306" y="84" width="12" height="92" rx="6" className="ca-brush" />
      <rect x="300" y="60" width="24" height="28" rx="9" className="ca-brush-soft" />
      <Sparkle x={70} y={80} s={0.9} />
    </>
  ),
  "toys-pause": () => (
    <>
      <rect x="70" y="132" width="260" height="88" rx="16" className="ca-box" />
      <circle cx="140" cy="106" r="26" className="ca-teddy" />
      <circle cx="118" cy="86" r="10" className="ca-teddy" />
      <circle cx="162" cy="86" r="10" className="ca-teddy" />
      <Face x={140} y={104} s={0.8} mood="sleepy" />
      <path d="M 226 120 L 268 120 L 260 150 L 234 150 Z" className="ca-peach" />
      <circle cx="247" cy="98" r="20" className="ca-crown" />
      <text x={188} y={70} className="ca-zzz">
        z z
      </text>
      <SpeechTag x={252} y={44} text="先放一放" />
    </>
  ),
  "shield-dive": () => (
    <>
      <path d="M 120 182 L 200 70 L 280 182 Z" className="ca-crown-2" />
      <path d="M 200 92 L 172 182 L 228 182 Z" className="ca-door-open" />
      <path d="M 300 88 l 44 14 l 0 34 q 0 30 -44 44 q -44 -14 -44 -44 l 0 -34 z" className="ca-shield" />
      <rect x="40" y="122" width="56" height="60" rx="10" className="ca-box" />
      <path d="M 60 110 q 0 -14 16 -14" className="ca-probe" />
      <circle cx="86" cy="104" r="6" className="ca-bubble" />
      <Sparkle x={110} y={50} s={1} />
      <SpeechTag x={136} y={214} text="盾牌训练营" />
    </>
  ),
  "fever-tell": () => (
    <>
      <rect x="50" y="150" width="220" height="70" rx="18" className="ca-bed" />
      <rect x="50" y="128" width="70" height="42" rx="14" className="ca-pillow" />
      <circle cx="94" cy="146" r="20" className="ca-skin" />
      <Face x={94} y={148} s={0.9} mood="worried" />
      <rect x="76" y="126" width="36" height="12" rx="6" className="ca-coolpad" />
      <rect x="122" y="152" width="52" height="10" rx="5" className="ca-tube" />
      <circle cx="178" cy="157" r="7" className="ca-tube-fill" />
      <Adult x={320} y={150} s={1.1} />
    </>
  ),
  "shield-remember": () => (
    <g className="ca-pulse-group">
      <Kid x={150} y={140} s={1.5} />
      <path d="M 260 88 l 46 16 l 0 40 q 0 42 -46 56 q -46 -14 -46 -56 l 0 -40 z" className="ca-shield" />
      <path d="M 260 118 L 260 178" className="ca-shield-line" />
      <Sparkle x={100} y={58} s={1.1} />
      <Sparkle x={340} y={66} s={0.9} />
    </g>
  ),

  /* ── 第 7 章 ── */
  "school-intro": () => (
    <>
      <rect x="110" y="80" width="180" height="130" rx="12" className="ca-factory" />
      <path d="M 96 84 L 200 30 L 304 84 Z" className="ca-factory-roof" />
      <rect x="175" y="140" width="50" height="70" rx="8" className="ca-door" />
      <rect x="128" y="104" width="34" height="30" rx="6" className="ca-lens" />
      <rect x="238" y="104" width="34" height="30" rx="6" className="ca-lens" />
      <rect x="46" y="140" width="46" height="58" rx="12" className="ca-backpack" />
      <rect x="46" y="140" width="46" height="20" rx="10" className="ca-backpack-flap" />
      <Sparkle x={332} y={56} s={1} />
    </>
  ),
  "school-plan": () => (
    <>
      <rect x="80" y="162" width="240" height="16" rx="8" className="ca-desk" />
      <Doctor x={112} y={122} s={1} />
      <Adult x={200} y={120} s={1} />
      <Kid x={282} y={128} s={1} />
      <rect x="300" y="56" width="66" height="72" rx="10" className="ca-clipboard" />
      <line x1="312" y1="82" x2="354" y2="82" className="ca-clip-line" />
      <circle cx="320" cy="104" r="6" className="ca-cross" />
    </>
  ),
  "class-sit": () => (
    <>
      <Kid x={120} y={112} s={1.3} />
      <Kid x={270} y={112} s={1.3} />
      <rect x="60" y="172" width="120" height="14" rx="7" className="ca-desk" />
      <rect x="210" y="172" width="120" height="14" rx="7" className="ca-desk" />
      <rect x="70" y="186" width="10" height="38" rx="4" className="ca-desk" />
      <rect x="160" y="186" width="10" height="38" rx="4" className="ca-desk" />
      <rect x="220" y="186" width="10" height="38" rx="4" className="ca-desk" />
      <rect x="310" y="186" width="10" height="38" rx="4" className="ca-desk" />
      <rect x="96" y="148" width="46" height="24" rx="6" className="ca-folder" />
      <Heart x={196} y={66} s={1} />
    </>
  ),
  "classmate-q": () => (
    <>
      <Kid x={120} y={130} s={1.4} />
      <Kid x={280} y={130} s={1.4} />
      <circle cx={150} cy={62} r={22} className="ca-bubble" />
      <text x={143} y={72} className="ca-equals">
        ?
      </text>
      <SpeechTag x={222} y={48} text="你的头发怎么了？" />
    </>
  ),
  "teacher-help": () => (
    <>
      <rect x="60" y="50" width="180" height="110" rx="12" className="ca-lab" />
      <line x1="84" y1="86" x2="216" y2="86" className="ca-clip-line" />
      <line x1="84" y1="112" x2="196" y2="112" className="ca-clip-line" />
      <Adult x={110} y={170} s={1.2} />
      <Kid x={250} y={176} s={1.1} />
      <Kid x={310} y={176} s={1.1} />
      <path d="M 140 150 q 40 -20 60 -40" className="ca-line-stroke" />
    </>
  ),
  "school-dive": () => (
    <>
      <circle cx="90" cy="90" r="34" className="ca-crown" />
      <rect x="82" y="118" width="16" height="40" rx="6" className="ca-trunk" />
      <circle cx="310" cy="80" r="28" className="ca-crown-2" />
      <rect x="303" y="104" width="14" height="36" rx="6" className="ca-trunk" />
      <ellipse cx="200" cy="200" rx="150" ry="26" className="ca-grass" />
      <Kid x={170} y={168} s={1.2} />
      <Kid x={240} y={172} s={1.2} />
      <Heart x={205} y={110} s={1.1} />
      <Sparkle x={140} y={60} s={0.9} />
    </>
  ),
  "sibling-feel": () => (
    <>
      <Kid x={180} y={140} s={1.5} mood="worried" />
      <circle cx="238" cy="168" r="24" className="ca-teddy" />
      <circle cx="220" cy="150" r="9" className="ca-teddy" />
      <circle cx="256" cy="150" r="9" className="ca-teddy" />
      <Heart x={110} y={70} s={1} />
      <Heart x={300} y={60} s={0.8} />
    </>
  ),
  "sibling-help": () => (
    <>
      <Adult x={110} y={140} s={1.2} />
      <Kid x={200} y={150} s={1.2} />
      <Kid x={280} y={154} s={1.05} />
      <rect x="226" y="176" width="52" height="34" rx="6" className="ca-folder" />
      <path d="M 138 152 Q 170 166 188 156" className="ca-hand-line" />
      <Heart x={200} y={70} s={1.1} />
    </>
  ),
  "school-remember": () => (
    <g className="ca-pulse-group">
      <rect x="118" y="146" width="36" height="44" rx="10" className="ca-backpack" />
      <Kid x={150} y={140} s={1.4} />
      <Kid x={250} y={140} s={1.4} />
      <path d="M 176 152 Q 200 164 224 152" className="ca-hand-line" />
      <Sparkle x={200} y={64} s={1.2} />
      <Sparkle x={320} y={90} s={0.9} />
    </g>
  ),

  /* ── 第 8 章 ── */
  "followup-intro": () => (
    <>
      <rect x="70" y="60" width="120" height="130" rx="12" className="ca-clipboard" />
      <rect x="104" y="48" width="52" height="20" rx="8" className="ca-box" />
      <line x1="86" y1="96" x2="174" y2="96" className="ca-clip-line" />
      <line x1="86" y1="124" x2="174" y2="124" className="ca-clip-line" />
      <line x1="86" y1="152" x2="174" y2="152" className="ca-clip-line" />
      <Sparkle x={150} y={124} s={1.1} />
      <rect x="240" y="90" width="110" height="110" rx="12" className="ca-coat" />
      <rect x="286" y="110" width="18" height="50" rx="6" className="ca-cross" />
      <rect x="270" y="126" width="50" height="18" rx="6" className="ca-cross" />
      <SpeechTag x={230} y={216} text="复查日" />
    </>
  ),
  "checkup-visit": () => (
    <>
      <Doctor x={120} y={140} s={1.3} />
      <Kid x={250} y={150} s={1.3} />
      <rect x="170" y="90" width="60" height="80" rx="8" className="ca-clipboard" />
      <line x1="182" y1="112" x2="218" y2="112" className="ca-clip-line" />
      <line x1="182" y1="132" x2="212" y2="132" className="ca-clip-line" />
      <Sparkle x={320} y={80} s={1} />
    </>
  ),
  "helpers-strong": () => (
    <>
      <RedCell x={110} y={130} r={40} />
      <WhiteCell x={205} y={120} r={40} />
      <Platelet x={295} y={140} r={32} />
      <Sparkle x={150} y={60} s={1} />
      <Sparkle x={250} y={54} s={1.2} />
      <Sparkle x={330} y={70} s={0.9} />
      <path d="M 70 80 l 10 -18 M 340 90 l 12 -16" className="ca-line-stroke" />
    </>
  ),
  "grow-taller": () => (
    <>
      <rect x="90" y="50" width="26" height="170" rx="8" className="ca-tag" />
      <line x1="90" y1="80" x2="104" y2="80" className="ca-clip-line" />
      <line x1="90" y1="110" x2="104" y2="110" className="ca-clip-line" />
      <line x1="90" y1="140" x2="104" y2="140" className="ca-clip-line" />
      <line x1="90" y1="170" x2="104" y2="170" className="ca-clip-line" />
      <Kid x={180} y={150} s={1.5} />
      <path d="M 116 140 L 150 140" className="ca-gap" />
      <path d="M 116 100 L 156 100" className="ca-line-stroke" />
      <Sparkle x={160} y={84} s={1} />
    </>
  ),
  "visits-less": () => (
    <>
      <rect x="50" y="70" width="130" height="120" rx="12" className="ca-clipboard" />
      <circle cx="80" cy="100" r="5" className="ca-cross" />
      <circle cx="115" cy="100" r="5" className="ca-cross" />
      <circle cx="150" cy="100" r="5" className="ca-cross" />
      <circle cx="80" cy="130" r="5" className="ca-cross" />
      <circle cx="115" cy="130" r="5" className="ca-cross" />
      <circle cx="150" cy="130" r="5" className="ca-cross" />
      <circle cx="80" cy="160" r="5" className="ca-cross" />
      <circle cx="115" cy="160" r="5" className="ca-cross" />
      <path d="M 188 130 l 22 0 M 204 122 l 10 8 l -10 8" className="ca-line-stroke" />
      <rect x="222" y="70" width="130" height="120" rx="12" className="ca-clipboard" />
      <circle cx="262" cy="110" r="5" className="ca-cross" />
      <circle cx="312" cy="150" r="5" className="ca-cross" />
    </>
  ),
  "checkup-note": () => (
    <>
      <Doctor x={110} y={140} s={1.2} />
      <Adult x={290} y={140} s={1.2} />
      <rect x="170" y="90" width="70" height="90" rx="10" className="ca-clipboard" />
      <line x1="184" y1="112" x2="226" y2="112" className="ca-clip-line" />
      <circle cx="205" cy="134" r="15" className="ca-gap" />
      <line x1="184" y1="160" x2="220" y2="160" className="ca-clip-line" />
      <path d="M 146 152 q 14 6 26 2 M 262 152 q -14 6 -26 2" className="ca-hand-line" />
    </>
  ),
  "unwell-sooner": () => (
    <>
      <Kid x={140} y={140} s={1.4} mood="worried" />
      <Adult x={240} y={136} s={1.3} />
      <path d="M 168 148 Q 200 160 218 150" className="ca-hand-line" />
      <rect x="300" y="90" width="80" height="110" rx="10" className="ca-coat" />
      <rect x="332" y="108" width="16" height="44" rx="5" className="ca-cross" />
      <rect x="318" y="122" width="44" height="16" rx="5" className="ca-cross" />
      <path d="M 272 150 q 20 -8 34 -10" className="ca-line-stroke" />
    </>
  ),
  "followup-remember": () => (
    <g className="ca-pulse-group">
      <Doctor x={130} y={150} s={1.15} />
      <Kid x={250} y={156} s={1.25} />
      <path d="M 162 148 Q 200 128 232 146" className="ca-hand-line" />
      <Sparkle x={200} y={110} s={1.4} />
      <RedCell x={80} y={80} r={18} />
      <WhiteCell x={320} y={76} r={18} />
      <Platelet x={330} y={200} r={14} />
    </g>
  ),
};

export function PanelArt({ artKey, alt }: { artKey: ArtKey; alt: string }) {
  const art = ART[artKey];
  return <Frame label={alt}>{art()}</Frame>;
}
