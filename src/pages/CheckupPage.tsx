import { useState } from "react";
import { Link } from "react-router-dom";
import { recoveryTips } from "@/src/data/recovery/recovery";
import { useAskedDoctor } from "@/src/lib/askedDoctor";
import {
  clearCheckupDraft,
  saveCheckupDraft,
  useCheckupDraft,
} from "@/src/lib/checkup";
import { usePageTitle } from "@/src/lib/usePageTitle";

export default function CheckupPage() {
  usePageTitle("复诊清单");
  const draft = useCheckupDraft();
  const asked = useAskedDoctor();
  const [questions, setQuestions] = useState(() => [0, 1, 2].map((index) => draft.questions[index] ?? ""));
  const [observations, setObservations] = useState(draft.observations);
  const [status, setStatus] = useState("");

  const askedTitles = asked
    .map((id) => recoveryTips.find((tip) => tip.id === id)?.title)
    .filter((title): title is string => Boolean(title));
  const filledQuestions = questions.map((question) => question.trim()).filter(Boolean);

  function updateQuestion(index: number, value: string) {
    const next = questions.map((question, itemIndex) => (itemIndex === index ? value : question));
    setQuestions(next);
    saveCheckupDraft({ questions: next, observations });
    setStatus("");
  }

  function updateObservations(value: string) {
    setObservations(value);
    saveCheckupDraft({ questions, observations: value });
    setStatus("");
  }

  function clearAll() {
    clearCheckupDraft();
    setQuestions(["", "", ""]);
    setObservations("");
    setStatus("已经清空，这一页没有留下内容。");
  }

  return (
    <div className="page page--checkup">
      <Link to="/feelings" className="back-link print-hide">
        ← 回到心里话
      </Link>

      <header className="chapter-head print-hide">
        <div>
          <p className="chapter-head__num">复诊准备</p>
          <h1 className="chapter-head__title">把想问的，写成一页</h1>
        </div>
      </header>
      <p className="page-lead print-hide">
        写下想问医生的问题，和这阵子观察到的情况。可以打印或截屏带去复诊。内容只留在当前标签页，关闭就清空。
      </p>

      <div className="checkup-editor print-hide">
        <section className="checkup-block" aria-labelledby="checkup-questions-title">
          <h2 id="checkup-questions-title">想问医生的问题（最多 3 个）</h2>
          <div className="checkup-fields">
            {questions.map((question, index) => (
              <label key={index} className="checkup-field">
                <span>问题 {index + 1}</span>
                <input
                  type="text"
                  value={question}
                  maxLength={80}
                  placeholder={
                    index === 0 ? "比如：这次复查要查哪些项目？" : index === 1 ? "比如：最近总没胃口，要紧吗？" : "还想问的…"
                  }
                  onChange={(event) => updateQuestion(index, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="checkup-block" aria-labelledby="checkup-observations-title">
          <h2 id="checkup-observations-title">想告诉医生的情况</h2>
          <label className="checkup-field">
            <span>这阵子的观察（最多 500 字）</span>
            <textarea
              value={observations}
              maxLength={500}
              rows={6}
              placeholder="比如：这周有几天没胃口；走路比上周容易累；晚上睡得不踏实。"
              onChange={(event) => updateObservations(event.target.value)}
            />
          </label>
        </section>

        {askedTitles.length > 0 && (
          <section className="checkup-block" aria-labelledby="checkup-asked-title">
            <h2 id="checkup-asked-title">在康复卡片上勾过「已问过医生」</h2>
            <ul className="checkup-asked">
              {askedTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="button-row">
          <button type="button" className="primary-button" onClick={() => window.print()}>
            打印这一页
          </button>
          <button type="button" className="text-button" onClick={clearAll} disabled={!filledQuestions.length && !observations.trim()}>
            清空清单
          </button>
        </div>
        <p className="checkup-status" role="status" aria-live="polite">
          {status}
        </p>

        <p className="page-note">
          这一页只保存在当前标签页，刷新或关闭就清空；不会上传，也不需要登录。它不替代医生判断。
        </p>
      </div>

      <section className="checkup-sheet print-only" aria-hidden="true">
        <p className="checkup-sheet__eyebrow">复诊清单</p>
        <h1>想问医生的问题</h1>
        {filledQuestions.length > 0 ? (
          <ol>
            {filledQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>
        ) : (
          <p className="checkup-sheet__empty">（还没写问题）</p>
        )}
        <h2>想告诉医生的情况</h2>
        <p className="checkup-sheet__observations">{observations.trim() || "（还没写观察）"}</p>
        {askedTitles.length > 0 && (
          <>
            <h2>已经问过医生的事</h2>
            <ul>
              {askedTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        )}
        <p className="checkup-sheet__foot">由「骨髓小工厂」整理 · 不替代医生判断 · 具体安排以孩子所在医院治疗团队为准</p>
      </section>
    </div>
  );
}