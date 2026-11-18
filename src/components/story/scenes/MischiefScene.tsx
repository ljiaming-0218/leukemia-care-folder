import { useState } from "react";
import { CellBuddy, type CellKind } from "@/src/components/story/CellBuddy";

const HEALTHY: CellKind[] = Array.from({ length: 20 }, (_, index) =>
  (["red", "red", "white", "platelet"] as const)[index % 4],
);
const KEEP_WHEN_SICK = new Set([2, 9, 13, 18]);

const MYTHS = [
  { question: "是因为我做错了什么吗？", answer: "不是。你做的事、说的话、想的念头，都不会让人得白血病。它也不是惩罚。" },
  { question: "会传染给我的朋友吗？", answer: "不会。白血病不会传染，你可以放心地和朋友、家人拥抱。" },
  { question: "那为什么会出错？", answer: "细胞分裂的时候偶然出了一个小错误。这不是谁的错。" },
];

export function MischiefScene() {
  const [sick, setSick] = useState(false);
  const [openMyth, setOpenMyth] = useState<number | null>(null);

  const slots = HEALTHY.map((kind, index) => (sick && !KEEP_WHEN_SICK.has(index) ? "blast" : kind));
  const helpers = slots.filter((kind) => kind !== "blast").length;

  return (
    <div className="scene scene--mischief">
      <div className="segmented" role="group" aria-label="切换工厂状态">
        <button type="button" aria-pressed={!sick} onClick={() => setSick(false)}>
          正常的工厂
        </button>
        <button type="button" aria-pressed={sick} onClick={() => setSick(true)}>
          出错的工厂
        </button>
      </div>
      <div className={`marrow-grid ${sick ? "is-sick" : ""}`} aria-hidden="true">
        {slots.map((kind, index) => (
          <span key={index} className="marrow-grid__slot" style={{ transitionDelay: `calc(${index * 50}ms * var(--site-motion))` }}>
            <CellBuddy kind={kind} size={40} title="" mood={sick && kind !== "blast" ? "worried" : undefined} />
          </span>
        ))}
      </div>
      <p className="speech" aria-live="polite">
        {sick
          ? `没长大的细胞挤满了工厂，健康的小帮手只剩 ${helpers} 个，不够用了。`
          : `工厂里有 ${helpers} 个健康的小帮手，大家各干各的活。`}
      </p>

      <h3 className="scene-subtitle">小朋友常常会想……</h3>
      <ul className="myth-list">
        {MYTHS.map((myth, index) => {
          const open = openMyth === index;
          return (
            <li key={myth.question}>
              <button
                type="button"
                className="myth-card"
                aria-expanded={open}
                onClick={() => setOpenMyth(open ? null : index)}
              >
                <span className="myth-card__q">{myth.question}</span>
                <span className="myth-card__hint">{open ? "收起" : "点开看答案"}</span>
              </button>
              {open && <p className="myth-card__a">{myth.answer}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
