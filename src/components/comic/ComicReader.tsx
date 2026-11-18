import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PanelArt } from "@/src/components/comic/PanelArt";
import type { ComicPanel } from "@/src/data/comics/panels";
import { setVoiceOn, speak, stopSpeaking, useVoiceOn, voiceSupported } from "@/src/lib/voice";

const PROGRESS_KEY = "marrow-factory:comic-progress";

function readIndex(chapterId: string, panels: ComicPanel[]): number {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    if (parsed && typeof parsed === "object" && chapterId in parsed) {
      const value = (parsed as Record<string, unknown>)[chapterId];
      const index = panels.findIndex((panel) => panel.id === value);
      if (index > 0) return index;
    }
  } catch {
    // Progress is a convenience; ignore broken storage.
  }
  return 0;
}

function saveIndex(chapterId: string, panelId: string) {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    const next = { ...(parsed && typeof parsed === "object" ? parsed : {}), [chapterId]: panelId };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // Private mode: progress lasts for this visit only.
  }
}

function panelText(panel: ComicPanel): string {
  const parts: string[] = [];
  if (panel.caption) parts.push(panel.caption);
  for (const line of panel.dialogue ?? []) parts.push(`${line.speaker}说：${line.text}`);
  return parts.join(" ");
}

export function ComicReader({ panels, chapterId, hueClass }: { panels: ComicPanel[]; chapterId: string; hueClass: string }) {
  const [index, setIndex] = useState(() => readIndex(chapterId, panels));
  const [paused, setPaused] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceOn = useVoiceOn();
  const speechAvailable = voiceSupported();

  const panel = panels[Math.min(index, panels.length - 1)];
  const isLast = index >= panels.length - 1;
  const canPrev = index > 0;

  useEffect(() => {
    if (panel) saveIndex(chapterId, panel.id);
  }, [chapterId, panel]);

  useEffect(() => () => stopSpeaking(), []);

  function goTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(panels.length - 1, nextIndex));
    if (clamped === index) return;
    stopSpeaking();
    setSpeaking(false);
    setIndex(clamped);
  }

  function speakPanel() {
    if (!speechAvailable || !panel) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!voiceOn) setVoiceOn(true);
    const started = speak(panelText(panel), () => setSpeaking(false));
    setSpeaking(started);
  }

  if (!panel) return null;

  const firstWarning = panels.find((item) => item.contentWarning)?.contentWarning;

  return (
    <section
      className={`comic hue-root ${hueClass} ${paused ? "is-paused" : ""} ${staticMode ? "is-static" : ""}`}
      aria-label="动态漫画"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          goTo(index + 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          goTo(index - 1);
        }
      }}
    >
      <div className="comic__bar" role="group" aria-label="漫画控制">
        <button type="button" className="text-button" onClick={() => setPaused((value) => !value)} disabled={staticMode}>
          {paused ? "继续动画" : "暂停动画"}
        </button>
        {speechAvailable && (
          <button type="button" className="text-button" onClick={speakPanel}>
            {speaking ? "停下来" : voiceOn ? "读给我听" : "开声音读给我听"}
          </button>
        )}
        <button
          type="button"
          className="text-button"
          aria-pressed={staticMode}
          onClick={() => {
            stopSpeaking();
            setSpeaking(false);
            setStaticMode((value) => !value);
          }}
        >
          静态模式
        </button>
      </div>

      {firstWarning && (
        <p className="comic__warning" role="note">
          {firstWarning}
        </p>
      )}

      <figure
        key={panel.id}
        className={`panel comic__stage motion-${panel.motion} is-visible`}
        aria-label={`第 ${index + 1} 格，共 ${panels.length} 格`}
        style={panel.durationMs ? ({ "--panel-duration": `${panel.durationMs}ms` } as React.CSSProperties) : undefined}
      >
        <div
          className={`panel__art comic__art ${isLast ? "" : "is-tappable"}`}
          onClick={isLast ? undefined : () => goTo(index + 1)}
        >
          <PanelArt artKey={panel.art} alt={panel.alt} />
        </div>
        <figcaption className="panel__text">
          {panel.caption && <p className="panel__caption">{panel.caption}</p>}
          {panel.dialogue?.map((line) => (
            <p key={line.speaker + line.text} className="panel__dialogue">
              <span className="panel__speaker">{line.speaker}：</span>
              {line.text}
            </p>
          ))}
          {panel.scene3dId && (
            <Link
              className="primary-button panel__dive"
              to={`/explore?scene=${panel.scene3dId}&back=${encodeURIComponent(`/story/${chapterId}`)}`}
            >
              进身体看看
            </Link>
          )}
        </figcaption>
        <div className="comic__foot">
          <button type="button" className="text-button" onClick={() => goTo(index - 1)} disabled={!canPrev}>
            上一格
          </button>
          <span className="comic__count">
            第 {index + 1} 格，共 {panels.length} 格
          </span>
          <button type="button" className="primary-button comic__next" onClick={() => (isLast ? goTo(0) : goTo(index + 1))}>
            {isLast ? "再看一遍" : "接着看"}
          </button>
        </div>
        <div className="comic__meta">
          <div className="comic__dots" aria-hidden="true">
            {panels.map((item, dotIndex) => (
              <span key={item.id} className={`comic__dot ${dotIndex <= index ? "is-on" : ""} ${dotIndex === index ? "is-now" : ""}`} />
            ))}
          </div>
          {!isLast && <span className="comic__tap-hint">点一下画面也能接着看</span>}
        </div>
      </figure>

      <p className="sr-only" aria-live="polite">
        {speaking ? "正在朗读这一格" : ""}
      </p>
      <p className="sr-only" aria-live="polite">
        {`第 ${index + 1} 格，共 ${panels.length} 格。${panel.caption ?? ""}`}
      </p>
    </section>
  );
}
