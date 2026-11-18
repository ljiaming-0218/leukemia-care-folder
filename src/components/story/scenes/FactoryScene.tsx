import { useState } from "react";
import { CellBuddy, type CellKind } from "@/src/components/story/CellBuddy";

const BELT: Extract<CellKind, "red" | "white" | "platelet">[] = ["red", "white", "platelet", "red", "white", "red"];

function TreeView() {
  return (
    <svg viewBox="0 0 320 260" className="tree-view" role="img" aria-label="一棵树：树根代表骨髓，树叶代表血液里的细胞">
      <g className="tree-leaves">
        <circle cx="160" cy="70" r="54" />
        <circle cx="104" cy="96" r="38" />
        <circle cx="216" cy="96" r="38" />
      </g>
      <g className="tree-dots">
        <circle cx="140" cy="60" r="7" className="dot-red" />
        <circle cx="178" cy="78" r="7" className="dot-white" />
        <circle cx="112" cy="98" r="5" className="dot-platelet" />
        <circle cx="206" cy="104" r="7" className="dot-red" />
        <circle cx="162" cy="40" r="5" className="dot-platelet" />
      </g>
      <rect x="148" y="118" width="24" height="70" rx="6" className="tree-trunk" />
      <line x1="0" y1="188" x2="320" y2="188" className="tree-ground" />
      <g className="tree-roots">
        <path d="M160 188 C150 210 120 214 96 236" />
        <path d="M160 188 C168 214 200 218 228 238" />
        <path d="M160 188 C160 212 156 228 160 250" />
      </g>
      <text x="250" y="60" className="tree-label">树叶 = 血液里的细胞</text>
      <text x="196" y="252" className="tree-label">树根 = 骨髓</text>
    </svg>
  );
}

export function FactoryScene() {
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState<"factory" | "tree">("factory");

  return (
    <div className="scene scene--factory">
      <div className="segmented" role="group" aria-label="换一个比喻">
        <button type="button" aria-pressed={view === "factory"} onClick={() => setView("factory")}>
          造血工厂
        </button>
        <button type="button" aria-pressed={view === "tree"} onClick={() => setView("tree")}>
          大树的根
        </button>
      </div>

      {view === "factory" ? (
        <>
          <div className={`factory ${paused ? "is-paused" : ""}`}>
            <div className="factory__bone" aria-hidden="true">
              <span className="factory__sponge" />
            </div>
            <ol className="factory__stations">
              <li>
                <CellBuddy kind="stem" size={44} title="" />
                <span>细胞出生</span>
              </li>
              <li>
                <span className="grow-icon" aria-hidden="true">
                  <CellBuddy kind="stem" size={30} title="" />
                  <CellBuddy kind="stem" size={44} title="" />
                </span>
                <span>长大学本领</span>
              </li>
              <li>
                <CellBuddy kind="red" size={44} title="" />
                <span>长大才出厂</span>
              </li>
            </ol>
            <div className="belt" aria-hidden="true">
              {BELT.map((kind, index) => (
                <span
                  key={index}
                  className="belt__item"
                  style={{ animationDelay: `calc(${-index * 1.5}s * var(--site-motion))` }}
                >
                  <span className="belt__stem">
                    <CellBuddy kind="stem" size={40} title="" />
                  </span>
                  <span className="belt__grown">
                    <CellBuddy kind={kind} size={40} title="" />
                  </span>
                </span>
              ))}
            </div>
            <div className="factory__vessel" aria-hidden="true">
              <span>血管</span>
            </div>
          </div>
          <button type="button" className="text-button" onClick={() => setPaused((value) => !value)}>
            {paused ? "继续播放动画" : "暂停动画"}
          </button>
        </>
      ) : (
        <TreeView />
      )}
      <p className="speech">
        {view === "factory"
          ? "细胞宝宝在骨髓工厂里出生，长大以后变成红细胞、白细胞和血小板，再出厂进入血管。"
          : "骨髓像大树的根，血液里的细胞像树叶。叶子出了问题，医生要到「根」上去找原因。"}
      </p>
    </div>
  );
}
