import { CellBuddy } from "@/src/components/story/CellBuddy";

/* 康复花园的 2D 降级图：省电模式或无 WebGL 时替代 3D，内容与热点按钮等价。 */

export function GardenScene2D() {
  return (
    <div className="scene scene--garden">
      <svg viewBox="0 0 400 260" className="panel-art" role="img" aria-label="康复花园：小路、大树、小床、饭碗、书包和手拉手的朋友">
        <rect x="0" y="0" width="400" height="260" rx="18" className="ca-bg" />
        <circle cx="345" cy="48" r="24" className="ca-sparkle" />
        <rect x="0" y="196" width="400" height="64" rx="18" className="ca-grass" />
        <g>
          <rect x="52" y="140" width="14" height="60" rx="6" className="ca-trunk" />
          <circle cx="59" cy="126" r="34" className="ca-crown" />
        </g>
        <g>
          <rect x="330" y="150" width="12" height="50" rx="6" className="ca-trunk" />
          <circle cx="336" cy="138" r="28" className="ca-crown-2" />
        </g>
        {[250, 214, 178, 142].map((x, index) => (
          <ellipse key={x} cx={x + (index % 2 ? 8 : -8)} cy={228 - index * 4} rx="20" ry="8" className="ca-stone" />
        ))}
        <g>
          <rect x="24" y="196" width="86" height="14" rx="7" className="ca-bed" />
          <rect x="28" y="182" width="26" height="14" rx="7" className="ca-pillow" />
          <circle cx="42" cy="188" r="10" className="ca-skin" />
          <circle cx="30" cy="164" r="12" className="ca-moon" />
        </g>
        <g>
          <ellipse cx="196" cy="204" rx="26" ry="10" className="ca-bowl" />
          <circle cx="190" cy="198" r="6" className="ca-crown" />
          <circle cx="204" cy="198" r="5" className="ca-red" />
        </g>
        <g>
          <rect x="288" y="176" width="34" height="42" rx="8" className="ca-backpack" />
          <rect x="292" y="188" width="26" height="12" rx="5" className="ca-backpack-flap" />
        </g>
        <g>
          <circle cx="150" cy="160" r="14" className="ca-skin" />
          <rect x="138" y="174" width="24" height="28" rx="10" className="ca-kid-shirt" />
          <circle cx="196" cy="160" r="14" className="ca-skin" />
          <rect x="184" y="174" width="24" height="28" rx="10" className="ca-adult-shirt" />
          <path d="M 162 182 Q 173 190 184 182" className="ca-hand-line" />
          <path
            d="M 173 148 C 165 140, 171 132, 173 137 C 175 132, 181 140, 173 148 Z"
            className="ca-heart"
          />
        </g>
      </svg>
      <div className="garden-buddies" aria-hidden="true">
        <CellBuddy kind="red" size={44} className="bob" title="" />
        <CellBuddy kind="white" size={40} className="bob" title="" />
        <CellBuddy kind="platelet" size={36} className="bob" title="" />
      </div>
      <p className="speech">小帮手们也在花园里休息。好好睡觉、好好吃饭、慢慢活动，力气会一点点回来。</p>
    </div>
  );
}
