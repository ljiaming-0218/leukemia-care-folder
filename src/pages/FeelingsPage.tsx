import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FeelingPicker } from "@/src/components/feelings/FeelingPicker";
import { FeelingsToolbox } from "@/src/components/feelings/FeelingsToolbox";
import { GrownUpFeelings } from "@/src/components/feelings/GrownUpFeelings";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import {
  COURAGE_ACTS,
  FAULT_QUESTIONS,
  FEELING_ENTRIES,
  SIBLING_MOODS,
  THEATER_SCENARIOS,
  WEATHER_OPTIONS,
  feelingTools,
  type FeelingEntryId,
  type FeelingToolId,
} from "@/src/data/feelings/feelings";
import { usePageTitle } from "@/src/lib/usePageTitle";
import { readCheckupDraft, saveCheckupDraft } from "@/src/lib/checkup";

type Audience = "kid" | "adult";

export default function FeelingsPage() {
  usePageTitle("心里话");
  const tools = useMemo(() => new Map<string, (typeof feelingTools)[number]>(feelingTools.map((tool) => [tool.id, tool])), []);
  const tool = (id: FeelingToolId) => tools.get(id)!;

  const { hash } = useLocation();
  const [activeTool, setActiveTool] = useState<FeelingToolId>("weather");
  const [feelingId, setFeelingId] = useState<FeelingEntryId | null>(null);
  const [audience, setAudience] = useState<Audience>("kid");
  const [weather, setWeather] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [fault, setFault] = useState<Record<number, boolean>>({});
  const [questions, setQuestions] = useState(["", "", ""]);
  const [copyState, setCopyState] = useState<"idle" | "done" | "fail">("idle");
  const [sticker, setSticker] = useState<string | null>(null);
  const [siblingMood, setSiblingMood] = useState<string | null>(null);
  const [siblingNote, setSiblingNote] = useState("");
  const [theater, setTheater] = useState<Record<string, number>>({});
  const shouldScrollToHelp = useRef(false);
  const shouldScrollToTools = useRef(false);
  const shouldScrollToPanel = useRef(false);

  const activeToolMeta = tool(activeTool);
  const feelingEntry = feelingId ? FEELING_ENTRIES.find((item) => item.id === feelingId) ?? null : null;
  const weatherLine = WEATHER_OPTIONS.find((item) => item.id === weather)?.line;

  useEffect(() => {
    const match = hash.match(/^#feelings-([a-z-]+)$/);
    const toolId = match?.[1];
    if (!toolId || !tools.has(toolId)) return;
    setAudience("kid");
    setFeelingId(null);
    setActiveTool(toolId as FeelingToolId);
    window.requestAnimationFrame(() => {
      document.getElementById("feelings-panel")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }, [hash, tools]);

  useEffect(() => {
    if (!running) return;
    const wait = phase === "in" ? 3000 : 4000;
    const timer = window.setTimeout(() => {
      if (phase === "in") {
        setPhase("out");
        return;
      }
      const next = round + 1;
      if (next >= 3) {
        setRound(3);
        setRunning(false);
        setPhase("idle");
      } else {
        setRound(next);
        setPhase("in");
      }
    }, wait);
    return () => window.clearTimeout(timer);
  }, [running, phase, round]);

  useEffect(() => {
    if (!shouldScrollToHelp.current || audience !== "adult") return;
    shouldScrollToHelp.current = false;
    const node = document.getElementById("grownup-help");
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [audience]);

  useEffect(() => {
    if (!shouldScrollToTools.current || audience !== "kid") return;
    shouldScrollToTools.current = false;
    const node = document.getElementById("feelings-toolbox");
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [audience]);

  useEffect(() => {
    if (!shouldScrollToPanel.current) return;
    shouldScrollToPanel.current = false;
    const node = document.getElementById("feelings-panel");
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [feelingId, activeTool]);

  function startBreathing() {
    setRound(0);
    setRunning(true);
    setPhase("in");
  }

  function chooseFeeling(next: FeelingEntryId) {
    if (next === feelingId) {
      setFeelingId(null);
      return;
    }
    const entry = FEELING_ENTRIES.find((item) => item.id === next);
    if (!entry) return;
    setRunning(false);
    setPhase("idle");
    setFeelingId(next);
    setActiveTool(entry.toolId);
    shouldScrollToPanel.current = true;
  }

  function selectTool(next: FeelingToolId) {
    setFeelingId(null);
    if (next !== "breathing") {
      setRunning(false);
      setPhase("idle");
    }
    setActiveTool(next);
  }

  function switchAudience(next: Audience) {
    if (next === "adult") {
      setRunning(false);
      setPhase("idle");
    }
    setAudience(next);
  }

  function showHelp() {
    shouldScrollToHelp.current = true;
    switchAudience("adult");
  }

  function returnToTools() {
    shouldScrollToTools.current = true;
    switchAudience("kid");
  }

  async function copyQuestions() {
    const text = questions
      .map((question, index) => (question.trim() ? `${index + 1}. ${question.trim()}` : ""))
      .filter(Boolean)
      .join("\n");
    if (!text) {
      setCopyState("fail");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("done");
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      setCopyState(ok ? "done" : "fail");
    }
  }

  function renderToolBody() {
    switch (activeTool) {
      case "weather":
        return (
          <>
            <div className="weather-row">
              {WEATHER_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={weather === item.id ? "weather-chip is-active" : "weather-chip"}
                  aria-pressed={weather === item.id}
                  onClick={() => setWeather(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {weatherLine && (
              <p className="feeling-feedback" aria-live="polite">
                {weatherLine}
              </p>
            )}
          </>
        );

      case "breathing":
        return (
          <>
            <div className={running ? "breathing-stage is-running" : "breathing-stage"}>
              <div
                className={phase === "in" ? "breathing-bubble is-in" : phase === "out" ? "breathing-bubble is-out" : "breathing-bubble"}
                aria-hidden="true"
              />
              <p className="breathing-label" aria-live="polite">
                {phase === "in" ? "慢慢吸气…" : phase === "out" ? "慢慢呼气…" : round >= 3 ? "做完 3 轮啦，感觉怎么样？" : "准备好就点开始"}
              </p>
              <p className="breathing-round">第 {Math.min(round + (running ? 1 : 0), 3)} / 3 轮</p>
            </div>
            <div className="button-row">
              {running ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setRunning(false);
                    setPhase("idle");
                  }}
                >
                  停下来
                </button>
              ) : (
                <button type="button" className="primary-button" onClick={startBreathing}>
                  {round >= 3 ? "再来 3 轮" : "开始吹泡泡"}
                </button>
              )}
            </div>
          </>
        );

      case "not-your-fault":
        return (
          <div className="fault-list">
            {FAULT_QUESTIONS.map((item, index) => {
              const chosen = fault[index];
              return (
                <div key={item.statement} className="fault-item">
                  <p className="fault-statement">{item.statement}</p>
                  <div className="button-row">
                    <button
                      type="button"
                      className={chosen === true ? "filter-chip is-active" : "filter-chip"}
                      aria-pressed={chosen === true}
                      onClick={() => setFault((prev) => ({ ...prev, [index]: true }))}
                    >
                      对
                    </button>
                    <button
                      type="button"
                      className={chosen === false ? "filter-chip is-active" : "filter-chip"}
                      aria-pressed={chosen === false}
                      onClick={() => setFault((prev) => ({ ...prev, [index]: false }))}
                    >
                      不对
                    </button>
                  </div>
                  {chosen !== undefined && (
                    <p className={chosen === item.answer ? "feeling-feedback is-right" : "feeling-feedback"} aria-live="polite">
                      {chosen === item.answer ? "答对啦！" : "再想想看～"} {item.explain}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );

      case "question-card":
        return (
          <>
            <ol className="question-list">
              {questions.map((value, index) => (
                <li key={index}>
                  <label>
                    <span className="visually-hidden">第 {index + 1} 个问题</span>
                    <input
                      type="text"
                      value={value}
                      maxLength={80}
                      placeholder={`第 ${index + 1} 个问题`}
                      onChange={(event) =>
                        setQuestions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                      }
                    />
                  </label>
                </li>
              ))}
            </ol>
            <div className="button-row">
              <button type="button" className="primary-button" onClick={copyQuestions}>
                复制问题
              </button>
              <button type="button" className="text-button" onClick={() => window.print()}>
                打印
              </button>
              <Link
                to="/checkup"
                className="text-button"
                onClick={() => {
                  const filled = questions.map((question) => question.trim()).filter(Boolean);
                  if (!filled.length) return;
                  const current = readCheckupDraft();
                  saveCheckupDraft({ ...current, questions: filled });
                }}
              >
                整理成复诊清单
              </Link>
            </div>
            {copyState !== "idle" && (
              <p className="feeling-feedback" role="status">
                {copyState === "done" ? "已经复制，可以粘贴给医生看。" : "复制没有成功，可以直接把问题读给医生听。"}
              </p>
            )}
          </>
        );

      case "courage-sticker":
        return (
          <>
            <div className="weather-row">
              {COURAGE_ACTS.map((act) => (
                <button
                  key={act}
                  type="button"
                  className={sticker === act ? "filter-chip is-active" : "filter-chip"}
                  aria-pressed={sticker === act}
                  onClick={() => setSticker(act)}
                >
                  {act}
                </button>
              ))}
            </div>
            {sticker && (
              <div className="courage-card" aria-live="polite">
                <CellBuddy kind="platelet" size={56} title="" />
                <div>
                  <p className="courage-card__title">给自己一张勇气贴纸</p>
                  <p className="courage-card__text">「{sticker}」，这件事不容易，你做到了。可以对自己说一句：我很勇敢。</p>
                </div>
              </div>
            )}
          </>
        );

      case "sibling":
        return (
          <>
            <div className="weather-row">
              {SIBLING_MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={siblingMood === mood ? "filter-chip is-active" : "filter-chip"}
                  aria-pressed={siblingMood === mood}
                  onClick={() => setSiblingMood(mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
            <label className="note-field">
              <span>想对爸爸妈妈说的一句话（只在这页显示）</span>
              <textarea
                value={siblingNote}
                maxLength={120}
                rows={3}
                placeholder="比如：我也想被抱一抱。"
                onChange={(event) => setSiblingNote(event.target.value)}
              />
            </label>
          </>
        );

      case "school-theater":
        return (
          <div className="theater-list">
            {THEATER_SCENARIOS.map((scenario) => {
              const picked = theater[scenario.id];
              return (
                <div key={scenario.id} className="theater-item">
                  <p className="theater-situation">{scenario.situation}</p>
                  <div className="theater-options">
                    {scenario.options.map((option, index) => (
                      <button
                        key={option.text}
                        type="button"
                        className={picked === index ? "theater-option is-active" : "theater-option"}
                        aria-pressed={picked === index}
                        onClick={() => setTheater((prev) => ({ ...prev, [scenario.id]: index }))}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                  {picked !== undefined && (
                    <p className="feeling-feedback" aria-live="polite">
                      {scenario.options[picked].reply}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="page page--feelings">
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>

      <header className="chapter-head">
        <div>
          <p className="chapter-head__num">心里话</p>
          <h1 className="chapter-head__title">害怕、生气、难过，都可以说</h1>
        </div>
      </header>
      <p className="page-lead">
        {audience === "kid"
          ? "先选一个此刻的感受，或直接挑工具；随时可以换，没有对错。"
          : "先看看怎么跟孩子说，再确认什么时候需要找专业的人。"}
      </p>

      <div className="feelings-switch" role="group" aria-label="切换阅读对象">
        <button type="button" aria-pressed={audience === "kid"} onClick={() => switchAudience("kid")}>
          孩子的工具
        </button>
        <button type="button" aria-pressed={audience === "adult"} onClick={() => switchAudience("adult")}>
          给大人
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {audience === "adult"
          ? "已切换到给大人：分龄话术和求助信号"
          : feelingEntry
            ? `已按「${feelingEntry.label}」打开「${activeToolMeta.title}」`
            : `已打开「${activeToolMeta.title}」`}
      </p>

      {audience === "kid" ? (
        <>
          <FeelingPicker selected={feelingId} panelId="feelings-panel" onSelect={chooseFeeling} />
          <FeelingsToolbox active={activeTool} panelId="feelings-panel" onSelect={selectTool} />

          <section
            className={activeTool === "question-card" ? "feeling-tool is-question-card" : "feeling-tool"}
            id="feelings-panel"
            aria-labelledby={`feelings-${activeTool}-title`}
          >
            <div className="feeling-tool__head">
              {feelingEntry && <p className="feeling-tool__kicker">按「{feelingEntry.label}」找到的</p>}
              <h2 id={`feelings-${activeTool}-title`}>{activeToolMeta.title}</h2>
              <p>{feelingEntry ? feelingEntry.reason : activeToolMeta.intro}</p>
              {feelingEntry && <p className="feeling-tool__line">可以对大人说：{feelingEntry.line}</p>}
            </div>
            <div className="feeling-tool__body">{renderToolBody()}</div>
            <p className="feeling-caution">{activeToolMeta.caution}</p>
          </section>

          <aside className="feelings-support" aria-label="需要帮助时">
            <button type="button" className="feelings-support__button" onClick={showHelp}>
              很难受，想找大人帮忙
            </button>
            <p>如果一直很难受、睡不着，或者不想治疗，告诉身边的大人。</p>
          </aside>
        </>
      ) : (
        <GrownUpFeelings onBack={returnToTools} />
      )}

      <p className="page-note">
        所有选择和输入默认只留在当前页面，刷新就清空；只有点「整理成复诊清单」时，问题才会写入当前标签页的复诊草稿。
      </p>
    </div>
  );
}
