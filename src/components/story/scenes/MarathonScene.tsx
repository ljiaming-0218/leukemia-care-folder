import { useState } from "react";

const LEGS = [
  { id: "induction", name: "诱导", line: "第一段：用药把大部分捣蛋细胞赶走，让工厂重新开工。这一段检查比较多，住院的时间可能长一些。" },
  { id: "consolidation", name: "巩固", line: "第二段：把剩下的捣蛋细胞继续清理干净，让它们不容易回来。" },
  { id: "maintenance", name: "维持", line: "第三段：常常是在家按时吃药，定期回医院检查。这一段也很重要，不能自己停药。" },
] as const;

const HAIR = [
  { label: "刚开始化疗", line: "头发还和以前一样。", hair: "full" },
  { label: "化疗几周后", line: "化疗药对付长得快的细胞，头发里的细胞也长得快，所以头发开始掉。", hair: "thin" },
  { label: "治疗中", line: "很多小朋友会变成光头。可以戴喜欢的帽子或头巾，不戴也完全可以。", hair: "none" },
  { label: "治疗后", line: "新头发冒出来了，软软的，像桃子上的绒毛。", hair: "fuzz" },
  { label: "再过一段时间", line: "头发慢慢长回来。新头发可能比以前更卷，摸起来也可能不太一样。", hair: "full" },
] as const;

function HairHead({ hair }: { hair: (typeof HAIR)[number]["hair"] }) {
  return (
    <svg viewBox="0 0 120 120" className={`hair-head hair-head--${hair}`} aria-hidden="true">
      {hair === "full" && <path d="M22 60c-4-30 18-46 38-46s42 16 38 46c-6-14-18-22-38-22S28 46 22 60z" className="hair" />}
      {hair === "thin" && (
        <g className="hair">
          <path d="M30 46c6-14 18-22 30-22s24 8 30 22c-8-8-18-12-30-12s-22 4-30 12z" />
          <circle cx="98" cy="88" r="3" className="hair-fall" />
          <circle cx="18" cy="96" r="2.5" className="hair-fall" />
        </g>
      )}
      <circle cx="60" cy="66" r="38" className="head" />
      {hair === "fuzz" && (
        <g className="fuzz">
          {Array.from({ length: 13 }, (_, index) => {
            const angle = Math.PI * (1.08 + (index / 12) * 0.84);
            return <circle key={index} cx={60 + Math.cos(angle) * 36} cy={66 + Math.sin(angle) * 36} r="2.4" />;
          })}
        </g>
      )}
      <circle cx="46" cy="66" r="4" className="face" />
      <circle cx="74" cy="66" r="4" className="face" />
      <path d="M48 82q12 10 24 0" className="smile" />
      <circle cx="38" cy="78" r="5" className="cheek" />
      <circle cx="82" cy="78" r="5" className="cheek" />
    </svg>
  );
}

export function MarathonScene() {
  const [leg, setLeg] = useState(0);
  const [hairStep, setHairStep] = useState(0);
  const hair = HAIR[hairStep];

  return (
    <div className="scene scene--marathon">
      <h3 className="scene-subtitle">长跑的三段路</h3>
      <div className="track" role="group" aria-label="选一段路看看">
        {LEGS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`track__leg ${index <= leg ? "is-reached" : ""}`}
            aria-pressed={leg === index}
            onClick={() => setLeg(index)}
          >
            <span className="track__num">{index + 1}</span>
            {item.name}
          </button>
        ))}
        <span className="track__runner" style={{ left: `calc(${(leg + 0.5) * (100 / LEGS.length)}% - 18px)` }} aria-hidden="true">
          <svg viewBox="0 0 36 36" width="36" height="36">
            <path d="M18 2l4.6 9.6 10.4 1.4-7.6 7.2 1.9 10.4L18 25.6l-9.3 5 1.9-10.4L3 13l10.4-1.4z" />
          </svg>
        </span>
      </div>
      <p className="speech" aria-live="polite">
        {LEGS[leg].line}
      </p>
      <p className="scene-note">每个小朋友每一段跑多久都不一样，医生会告诉你自己的跑道。</p>

      <h3 className="scene-subtitle">头发去哪儿了</h3>
      <div className="hair-stage">
        <HairHead hair={hair.hair} />
        <div className="hair-stage__text">
          <p className="hair-stage__label">{hair.label}</p>
          <p aria-live="polite">{hair.line}</p>
        </div>
      </div>
      <div className="stepper">
        <button type="button" className="text-button" disabled={hairStep === 0} onClick={() => setHairStep((value) => value - 1)}>
          上一步
        </button>
        <span className="stepper__dots" aria-hidden="true">
          {HAIR.map((_, index) => (
            <span key={index} className={index === hairStep ? "is-current" : ""} />
          ))}
        </span>
        <button
          type="button"
          className="primary-button"
          disabled={hairStep === HAIR.length - 1}
          onClick={() => setHairStep((value) => value + 1)}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
