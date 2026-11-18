import { useState } from "react";

type Choice = "do" | "wait" | "tell";

const OPTIONS: { id: Choice; label: string }[] = [
  { id: "do", label: "举起盾牌，这样做" },
  { id: "wait", label: "先放一放" },
  { id: "tell", label: "马上告诉大人" },
];

const ITEMS: { text: string; answer: Choice; why: string }[] = [
  { text: "吃饭前、上完厕所后洗手", answer: "do", why: "勤洗手是挡住病菌最简单的办法。" },
  { text: "按医生说的戴好口罩", answer: "do", why: "口罩是医生常说的小盾牌之一，什么时候戴听医生的。" },
  { text: "用软毛牙刷轻轻刷牙", answer: "do", why: "软毛牙刷不容易弄伤牙龈。" },
  { text: "白细胞少的时候，抱着毛绒玩具睡觉", answer: "wait", why: "医生建议这段时间先不玩毛绒玩具，等医生说可以了再抱。" },
  { text: "白细胞少的时候，去摸小猫小狗", answer: "wait", why: "这段时间先不和小动物亲近，可以隔着窗户跟它打招呼。" },
  { text: "和正在感冒咳嗽的小朋友一起玩", answer: "wait", why: "离生病的人远一点，等大家都好了再一起玩。" },
  { text: "身上发烫、发冷，觉得很不舒服", answer: "tell", why: "发烧可能说明病菌在捣乱，要马上告诉大人，大人会联系医生。" },
];

export function ShieldScene() {
  const [answers, setAnswers] = useState<Record<number, Choice>>({});
  const solved = ITEMS.filter((item, index) => answers[index] === item.answer).length;

  return (
    <div className="scene scene--shield">
      <div className="shield-meter" role="status" aria-live="polite">
        <svg viewBox="0 0 64 72" width="56" height="64" aria-hidden="true" className={`shield-icon ${solved === ITEMS.length ? "is-full" : ""}`}>
          <path d="M32 4l26 10v18c0 18-12 30-26 36C18 62 6 50 6 32V14z" className="shield-icon__base" />
          <clipPath id="shield-fill">
            <rect x="0" y={72 - (72 * solved) / ITEMS.length} width="64" height="72" />
          </clipPath>
          <path d="M32 4l26 10v18c0 18-12 30-26 36C18 62 6 50 6 32V14z" className="shield-icon__fill" clipPath="url(#shield-fill)" />
        </svg>
        <span>
          盾牌能量 {solved} / {ITEMS.length}
          {solved === ITEMS.length && "，满啦！"}
        </span>
      </div>
      <ol className="sort-list">
        {ITEMS.map((item, index) => {
          const picked = answers[index];
          const right = picked === item.answer;
          return (
            <li key={item.text} className={`sort-card ${picked ? (right ? "is-right" : "is-wrong") : ""}`}>
              <p className="sort-card__text">{item.text}</p>
              <div className="sort-card__options" role="group" aria-label={`「${item.text}」应该怎么办`}>
                {OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={picked === option.id}
                    disabled={right}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: option.id }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {picked && (
                <p className="sort-card__feedback" aria-live="polite">
                  {right ? `对！${item.why}` : "再想一想，换一个试试。"}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
