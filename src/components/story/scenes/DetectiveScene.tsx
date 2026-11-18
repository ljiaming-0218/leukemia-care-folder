import { useEffect, useRef, useState } from "react";

const TOOLS = [
  { id: "blood", name: "抽血（血常规）" },
  { id: "marrow", name: "骨髓穿刺（骨穿）" },
  { id: "id", name: "免疫分型" },
  { id: "spine", name: "腰椎穿刺（腰穿）" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

const CASES: { clue: string; answer: ToolId; why: string }[] = [
  {
    clue: "侦探想知道：血液里的小帮手够不够用？",
    answer: "blood",
    why: "抽一点点血就能数一数红细胞、白细胞和血小板。",
  },
  {
    clue: "侦探想走进骨髓工厂，看看里面的细胞长得怎么样。",
    answer: "marrow",
    why: "骨穿从髋骨里取一点点骨髓，身体很快会补回来。",
  },
  {
    clue: "侦探想查清楚：出错的到底是哪一种细胞？",
    answer: "id",
    why: "免疫分型给骨髓里的细胞查「身份」。它用的就是骨穿取出来的样本。",
  },
  {
    clue: "侦探想看看大脑和脊髓周围的液体里，有没有捣蛋的细胞。",
    answer: "spine",
    why: "腰穿从后腰取一点点这种液体，有时还会顺便把药送进去。",
  },
];

export function DetectiveScene() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<ToolId | null>(null);
  const headRef = useRef<HTMLParagraphElement>(null);
  const moved = useRef(false);
  const done = step >= CASES.length;
  const current = CASES[step];
  const correct = picked !== null && current && picked === current.answer;

  useEffect(() => {
    if (moved.current) headRef.current?.focus();
  }, [step]);

  const goTo = (next: number) => {
    moved.current = true;
    setStep(next);
    setPicked(null);
  };

  if (done) {
    return (
      <div className="scene scene--detective">
        <p className="speech speech--win" role="status" tabIndex={-1} ref={headRef}>
          4 个案子全破了！你已经认识医生的侦探工具啦。
        </p>
        <button type="button" className="text-button" onClick={() => goTo(0)}>
          再玩一次
        </button>
      </div>
    );
  }

  return (
    <div className="scene scene--detective">
      <p className="case-progress">
        第 {step + 1} 个案子，共 {CASES.length} 个
      </p>
      <p className="case-clue" tabIndex={-1} ref={headRef}>
        {current.clue}
      </p>
      <div className="tool-grid" role="group" aria-label="选一样侦探工具">
        {TOOLS.map((tool) => {
          const state = picked === tool.id ? (tool.id === current.answer ? "right" : "wrong") : "";
          return (
            <button
              key={tool.id}
              type="button"
              className={`tool-button ${state ? `is-${state}` : ""}`}
              aria-disabled={correct || undefined}
              onClick={() => {
                if (!correct) setPicked(tool.id);
              }}
            >
              <ToolIcon id={tool.id} />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>
      <p className="speech" aria-live="polite">
        {picked === null
          ? "选一样你觉得合适的工具。"
          : correct
            ? `答对了！${current.why}`
            : "这个工具查的是别的东西，再试一个吧。"}
      </p>
      {correct && (
        <button type="button" className="primary-button" onClick={() => goTo(step + 1)}>
          {step + 1 === CASES.length ? "看看结果" : "下一个案子"}
        </button>
      )}
    </div>
  );
}

function ToolIcon({ id }: { id: ToolId }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" className="tool-icon">
      {id === "blood" && <path d="M24 6c6 10 12 17 12 24a12 12 0 0 1-24 0c0-7 6-14 12-24z" />}
      {id === "marrow" && (
        <>
          <path d="M10 18a6 6 0 1 1 8-6h12a6 6 0 1 1 8 6v12a6 6 0 1 1-8 6H18a6 6 0 1 1-8-6z" />
          <ellipse cx="24" cy="24" rx="7" ry="4" className="tool-icon__inner" />
        </>
      )}
      {id === "id" && (
        <>
          <rect x="6" y="12" width="36" height="24" rx="4" />
          <circle cx="17" cy="24" r="5" className="tool-icon__inner" />
          <path d="M26 20h10M26 26h8" className="tool-icon__line" />
        </>
      )}
      {id === "spine" && (
        <>
          {[8, 16, 24, 32].map((y) => (
            <rect key={y} x="17" y={y} width="14" height="6" rx="3" />
          ))}
          <path d="M24 6v36" className="tool-icon__line" />
        </>
      )}
    </svg>
  );
}
