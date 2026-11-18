import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { CellsScene } from "@/src/components/story/scenes/CellsScene";
import { DetectiveScene } from "@/src/components/story/scenes/DetectiveScene";
import { FactoryScene } from "@/src/components/story/scenes/FactoryScene";
import { MarathonScene } from "@/src/components/story/scenes/MarathonScene";
import { ShieldScene } from "@/src/components/story/scenes/ShieldScene";
import { GardenScene2D } from "@/src/components/three/GardenScene2D";
import { getScene3D, scenes3D, type Scene3D } from "@/src/data/scenes/scenes";
import { Scene3DBoundary } from "@/src/components/three/Scene3DBoundary";
import { detectWebGL } from "@/src/components/three/webgl";
import { addSticker, useStickers } from "@/src/lib/stickers";
import { useMotion } from "@/src/lib/motion";
import { speak, stopSpeaking } from "@/src/lib/voice";
import { usePageTitle } from "@/src/lib/usePageTitle";

const Scene3DCanvas = lazy(() => import("@/src/components/three/Scene3DCanvas"));

const FALLBACKS: Record<Scene3D["fallback2d"], () => React.JSX.Element> = {
  factory: FactoryScene,
  cells: CellsScene,
  detective: DetectiveScene,
  marathon: MarathonScene,
  shield: ShieldScene,
  garden: GardenScene2D,
};

const POWER_KEY = "marrow-factory:power";

function readPowerSaving(): boolean {
  try {
    return localStorage.getItem(POWER_KEY) === "on";
  } catch {
    return false;
  }
}

function safeBackPath(value: string | null): string | null {
  if (!value) return null;
  return /^\/[A-Za-z0-9/_#-]*$/.test(value) && !value.startsWith("//") ? value : null;
}

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const scene = getScene3D(params.get("scene")) ?? scenes3D[0];
  const back = safeBackPath(params.get("back"));

  usePageTitle(`身体探险 · ${scene.title}`);
  const stickers = useStickers();
  const motion = useMotion();
  const webgl = useMemo(() => detectWebGL(), []);
  const [powerSaving, setPowerSaving] = useState(readPowerSaving);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  const reduced = motion === "reduce";
  const show3D = webgl && !powerSaving;
  const stickerId = `scene:${scene.id}`;
  const gotSticker = stickers.includes(stickerId);
  const hotspot = scene.hotspots.find((item) => item.id === activeHotspot);
  const FallbackView = FALLBACKS[scene.fallback2d];
  const fallbackView = (
    <div className="explore-fallback">
      <p className="explore-fallback__note">
        {powerSaving
          ? "省电模式已打开，用 2D 图代替 3D。热点按钮和讲解完全一样。"
          : "这台设备暂时打不开 3D，用 2D 图代替。热点按钮和讲解完全一样。"}
      </p>
      <p className="explore-fallback__scene">{scene.fallbackText}</p>
      <FallbackView />
    </div>
  );

  useEffect(() => () => stopSpeaking(), []);

  function togglePowerSaving() {
    const next = !powerSaving;
    setPowerSaving(next);
    try {
      localStorage.setItem(POWER_KEY, next ? "on" : "off");
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
  }

  function selectScene(id: string) {
    setActiveHotspot(null);
    setQuizChoice(null);
    stopSpeaking();
    setSpeaking(false);
    const next = new URLSearchParams(params);
    next.set("scene", id);
    setParams(next);
  }

  function chooseHotspot(id: string | null) {
    setActiveHotspot(id);
    setQuizChoice(null);
    if (!id) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const item = scene.hotspots.find((entry) => entry.id === id);
    if (!item) return;
    const started = speak(
      `${item.label}。${item.text}${item.extra} 小问答：${item.quiz.question}`,
      () => setSpeaking(false),
    );
    setSpeaking(started);
  }

  function chooseQuiz(optionIndex: number) {
    if (!hotspot) return;
    setQuizChoice(optionIndex);
    const right = optionIndex === hotspot.quiz.answer;
    speak(right ? `答对啦！${hotspot.quiz.explain}` : "再想想看，换一个答案试试。", () => setSpeaking(false));
  }

  return (
    <div className="page page--explore">
      {back ? (
        <Link to={back} className="back-link">
          ← 回到故事
        </Link>
      ) : (
        <Link to="/" className="back-link">
          ← 回到故事地图
        </Link>
      )}

      <header className="chapter-head">
        <span className="chapter-head__icon" aria-hidden="true">
          <CellBuddy kind={scene.sticker.kind} size={64} title="" />
        </span>
        <div>
          <p className="chapter-head__num">3D 身体探险</p>
          <h1 className="chapter-head__title">{scene.title}</h1>
        </div>
      </header>
      <p className="page-lead">{scene.teaser}</p>

      <div className="explore-tabs" role="group" aria-label="选择场景">
        {scenes3D.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === scene.id ? "tab is-active" : "tab"}
            aria-pressed={item.id === scene.id}
            onClick={() => selectScene(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {(scene.id === "vessel-highway" || scene.id === "shield-camp") && (
        <p className="explore-note">
          想帮白细胞练习拦病菌？<Link to="/game/patrol">去走巡逻小路</Link>。
        </p>
      )}

      {show3D && reduced && (
        <p className="explore-note">系统开启了「减少动态效果」，所以 3D 里的小动画会暂停，但场景仍然可以拖动和点击。想恢复漂浮，点页头的「动画」。</p>
      )}

      <div className="explore-layout">
        <div className="explore-stage hue-sky">
          <span className="stage-badge">{show3D ? "3D 互动" : "2D 图解"}</span>
          {show3D ? (
            <Scene3DBoundary key={scene.id} fallback={fallbackView}>
              <Suspense
                fallback={
                  <p className="stage-loading" role="status">
                    正在打开 3D 场景…
                  </p>
                }
              >
                <Scene3DCanvas
                  scene={scene}
                  activeHotspot={activeHotspot}
                  animate={!reduced}
                  onSelectHotspot={(id) => chooseHotspot(id === activeHotspot ? null : id)}
                />
              </Suspense>
            </Scene3DBoundary>
          ) : (
            fallbackView
          )}
          <p className="explore-hint">
            {show3D
              ? reduced
                ? "拖动旋转 · 双指缩放 · 点金色圈"
                : "一根手指拖动旋转 · 两指捏合缩放 · 点金色的圈看介绍"
              : "2D 模式：下面的热点按钮和 3D 里内容一样"}
          </p>
        </div>

        <div className="explore-side">
          <section className="explore-hotspots" aria-labelledby="hotspots-title">
            <h2 id="hotspots-title">场景里的热点</h2>
            <div className="hotspot-row" role="group" aria-label="热点列表">
              {scene.hotspots.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === activeHotspot ? "hotspot-button is-active" : "hotspot-button"}
                  aria-pressed={item.id === activeHotspot}
                  onClick={() => chooseHotspot(item.id === activeHotspot ? null : item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="speech" aria-live="polite">
              {hotspot ? `${hotspot.text}${hotspot.extra}` : "点一个热点，听听这里在发生什么。"}
              {speaking && "（正在读给你听）"}
            </p>
            {speaking && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  stopSpeaking();
                  setSpeaking(false);
                }}
              >
                停下来
              </button>
            )}
            {hotspot && (
              <div className="hotspot-quiz">
                <p className="hotspot-quiz__q">{hotspot.quiz.question}</p>
                <div className="hotspot-quiz__options" role="group" aria-label="小问答选项">
                  {hotspot.quiz.options.map((option, index) => {
                    const chosen = quizChoice === index;
                    const right = chosen && index === hotspot.quiz.answer;
                    const wrong = chosen && index !== hotspot.quiz.answer;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={
                          right ? "quiz-option is-right" : wrong ? "quiz-option is-wrong" : "quiz-option"
                        }
                        aria-pressed={chosen}
                        onClick={() => chooseQuiz(index)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {quizChoice !== null && (
                  <p
                    className={
                      quizChoice === hotspot.quiz.answer
                        ? "hotspot-quiz__feed is-right"
                        : "hotspot-quiz__feed is-wrong"
                    }
                    aria-live="polite"
                  >
                    {quizChoice === hotspot.quiz.answer
                      ? `答对啦！${hotspot.quiz.explain}`
                      : "再想想看～换一个答案试试。"}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="explore-passport" aria-labelledby="passport-title">
            <h2 id="passport-title">探险护照</h2>
            <p className="page-note">
              已收集 {stickers.filter((id) => id.startsWith("scene:")).length} / {scenes3D.length} 张细胞贴纸 ·
              逛完当前场景就能领一张
            </p>
            <div className="sticker-grid">
              {scenes3D.map((item) => {
                const unlocked = stickers.includes(`scene:${item.id}`);
                return (
                  <div key={item.id} className={unlocked ? "sticker-card" : "sticker-card is-locked"}>
                    <CellBuddy kind={item.sticker.kind} size={36} title="" />
                    <div>
                      <p className="sticker-card__title">{unlocked ? item.sticker.title : item.title}</p>
                      {unlocked && <p className="sticker-card__text">{item.sticker.text}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {gotSticker ? (
              <p className="sticker-done">
                <span aria-hidden="true">★</span> 「{scene.title}」的细胞贴纸已经拿到了
              </p>
            ) : (
              <button
                type="button"
                className="primary-button sticker-button"
                onClick={() => addSticker(stickerId)}
              >
                领取「{scene.title}」贴纸
              </button>
            )}
          </section>
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="text-button" aria-pressed={powerSaving} onClick={togglePowerSaving}>
          {powerSaving ? "关掉省电模式（回到 3D）" : "打开省电模式（改用 2D 图）"}
        </button>
        {!webgl && <p className="page-note">这台设备不支持 3D 画面，已自动切换为内容一样的 2D 模式。</p>}
      </div>
    </div>
  );
}
