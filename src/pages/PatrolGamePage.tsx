import { useState } from "react";
import { Link } from "react-router-dom";
import { PatrolBoard } from "@/src/components/game/PatrolBoard";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { SourceList } from "@/src/components/story/SourceList";
import { getPatrolLevel, patrolGame } from "@/src/data/games/patrol";
import { usePageTitle } from "@/src/lib/usePageTitle";

type Phase = "playing" | "blocked" | "escaped";

type GameState = {
  levelId: string;
  whiteAt: string;
  germStep: number;
  phase: Phase;
  moves: number;
  notice: string;
};

function startLevel(levelId: string): GameState {
  const level = getPatrolLevel(levelId);
  return {
    levelId: level.id,
    whiteAt: level.whiteStart,
    germStep: 0,
    phase: "playing",
    moves: 0,
    notice: `病菌在「${level.germPath[0] ? level.nodes.find((node) => node.id === level.germPath[0])?.label : ""}」。点一个亮起来的路口，白细胞就走一步。`,
  };
}

function canWalk(level: ReturnType<typeof getPatrolLevel>, from: string, to: string): boolean {
  return level.edges.some(([a, b]) => (a === from && b === to) || (a === to && b === from));
}

export default function PatrolGamePage() {
  usePageTitle("巡逻小路");
  const [state, setState] = useState<GameState>(() => startLevel(patrolGame.levels[0].id));
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [hintOpen, setHintOpen] = useState(false);
  const level = getPatrolLevel(state.levelId);
  const levelIndex = patrolGame.levels.findIndex((item) => item.id === level.id);
  const nextLevel = patrolGame.levels[levelIndex + 1];
  const germNode = level.nodes.find((node) => node.id === level.germPath[state.germStep]);
  const whiteNode = level.nodes.find((node) => node.id === state.whiteAt);

  function move(id: string) {
    if (state.phase !== "playing" || !canWalk(level, state.whiteAt, id)) return;
    const target = level.nodes.find((node) => node.id === id);
    const pathIndex = level.germPath.indexOf(id);
    const nextMoves = state.moves + 1;

    if (pathIndex >= 0 && pathIndex >= state.germStep) {
      const caughtUp = pathIndex === state.germStep;
      setState({
        ...state,
        whiteAt: id,
        moves: nextMoves,
        phase: "blocked",
        notice: caughtUp
          ? `追上啦！白细胞在「${target?.label ?? "路口"}」挡住了病菌。`
          : `拦住啦！白细胞先站到了「${target?.label ?? "路口"}」，病菌只好掉头。`,
      });
      setCompleted((current) => {
        if (current.has(level.id)) return current;
        const next = new Set(current);
        next.add(level.id);
        return next;
      });
      return;
    }

    const nextGermStep = state.germStep + 1;
    if (nextGermStep >= level.germPath.length - 1) {
      setState({
        ...state,
        whiteAt: id,
        germStep: nextGermStep,
        moves: nextMoves,
        phase: "escaped",
        notice: "这次病菌从旁边溜过去了。没关系，再来一次，这次提前在前面等它。",
      });
      return;
    }

    setState({
      ...state,
      whiteAt: id,
      germStep: nextGermStep,
      moves: nextMoves,
      notice: `你走到了「${target?.label ?? "路口"}」，病菌也往前挪了一步。`,
    });
  }

  function notice(message: string) {
    setState((current) => ({ ...current, notice: message }));
  }

  function chooseLevel(id: string) {
    setState(startLevel(id));
    setHintOpen(false);
  }

  function restart() {
    setState(startLevel(state.levelId));
    setHintOpen(false);
  }

  return (
    <div className="page page--patrol">
      <Link to="/explore?scene=vessel-highway" className="back-link">
        ← 回到血管公路
      </Link>

      <header className="chapter-head">
        <span className="chapter-head__icon" aria-hidden="true">
          <CellBuddy kind="white" size={64} title="" />
        </span>
        <div>
          <p className="chapter-head__num">小游戏 · 白细胞拦病菌</p>
          <h1 className="chapter-head__title">巡逻小路</h1>
        </div>
      </header>
      <p className="page-lead">{patrolGame.intro}</p>

      <div className="patrol-layout">
        <section className="patrol-stage" aria-labelledby="patrol-level-title">
          <div className="patrol-levels" role="group" aria-label="选择关卡">
            {patrolGame.levels.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={item.id === level.id ? "patrol-level is-active" : "patrol-level"}
                aria-pressed={item.id === level.id}
                onClick={() => chooseLevel(item.id)}
              >
                <span>第 {index + 1} 关</span>
                <strong>{item.title}</strong>
                {completed.has(item.id) && <span className="patrol-level__done">走通了</span>}
              </button>
            ))}
          </div>

          <div className="patrol-stage__head">
            <div>
              <h2 id="patrol-level-title">{level.title}</h2>
              <p>{level.teaser}</p>
            </div>
            <p className="patrol-steps">走了 {state.moves} 步</p>
          </div>

          <div className="patrol-legend" aria-hidden="true">
            <span>
              <CellBuddy kind="white" size={22} title="" /> 白细胞
            </span>
            <span>
              <i className="patrol-legend__germ" /> 病菌
            </span>
            <span>
              <i className="patrol-legend__walk" /> 亮起来 = 可以走
            </span>
          </div>

          <PatrolBoard
            level={level}
            whiteAt={state.whiteAt}
            germAt={level.germPath[state.germStep]}
            phase={state.phase}
            onMove={move}
            onNotice={notice}
          />

          <p className="patrol-status" aria-live="polite">
            {state.notice}
            {germNode && whiteNode && (
              <span className="patrol-status__where">
                病菌在「{germNode.label}」，白细胞在「{whiteNode.label}」。
              </span>
            )}
          </p>
        </section>

        <aside className="patrol-side" aria-label="玩法、提示和结果">
          <section className="patrol-panel">
            <h2>怎么玩</h2>
            <ol>
              {patrolGame.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </section>

          {state.phase === "blocked" && (
            <section className="patrol-result is-win">
              <h2>拦住啦</h2>
              <p>你练会了：{level.lesson}</p>
              <div className="button-row">
                {nextLevel ? (
                  <button type="button" className="primary-button" onClick={() => chooseLevel(nextLevel.id)}>
                    下一关：{nextLevel.title}
                  </button>
                ) : (
                  <Link to="/story/shield" className="primary-button">
                    去读第 6 章
                  </Link>
                )}
                <button type="button" className="text-button" onClick={restart}>
                  再走一遍
                </button>
              </div>
            </section>
          )}

          {state.phase === "escaped" && (
            <section className="patrol-result">
              <h2>这次没拦住</h2>
              <p>没有关系，这也是一次练习。看看病菌走的路线，再试一次。</p>
              <button type="button" className="primary-button" onClick={restart}>
                再来一次
              </button>
            </section>
          )}

          {state.phase === "playing" && (
            <section className="patrol-panel">
              <h2>需要一点提示吗</h2>
              <button
                type="button"
                className="text-button"
                aria-expanded={hintOpen}
                onClick={() => setHintOpen((open) => !open)}
              >
                {hintOpen ? "收起提示" : "看看提示"}
              </button>
              {hintOpen && <p className="patrol-hint">{level.hint}</p>}
              <button type="button" className="text-button" onClick={restart}>
                重新开始这一关
              </button>
            </section>
          )}

          <p className="page-note">{patrolGame.safety}</p>
        </aside>
      </div>

      <section aria-labelledby="patrol-sources">
        <h2 id="patrol-sources">来源</h2>
        <SourceList ids={patrolGame.sourceIds} />
        <p className="page-note">本站核对 {patrolGame.verifiedAt} · 游戏只帮助理解，不替代治疗团队。</p>
      </section>

      <div className="button-row">
        <Link to="/story/shield" className="text-button">
          读第 6 章：身体的盾牌
        </Link>
        <Link to="/explore?scene=vessel-highway" className="text-button">
          进血管公路看看
        </Link>
      </div>
    </div>
  );
}
