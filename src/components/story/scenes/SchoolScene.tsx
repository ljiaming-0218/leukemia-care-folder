import { useState } from "react";
import { CellBuddy } from "@/src/components/story/CellBuddy";

const QUESTIONS: { id: string; ask: string; answer: string }[] = [
  {
    id: "hair",
    ask: "你的头发怎么掉了？",
    answer: "治病的药会让头发暂时掉掉，以后会长回来。你想摸摸吗？软软的，像桃子上的绒毛。",
  },
  {
    id: "catch",
    ask: "你的病会传染吗？",
    answer: "不会传染。我们一起上课、一起玩、一起吃东西都没有问题。",
  },
  {
    id: "play",
    ask: "下课要跟我们一起玩吗？",
    answer: "好呀！不过我现在容易累，我们玩安静一点的游戏，累了我就先休息一会儿。",
  },
  {
    id: "mask",
    ask: "你为什么总戴口罩？",
    answer: "我身体里的小卫士还比较少，口罩帮我挡住病菌，不是因为我不想理你们。",
  },
];

export function SchoolScene() {
  const [active, setActive] = useState<string | null>(null);
  const current = QUESTIONS.find((question) => question.id === active);

  return (
    <div className="scene scene--school">
      <p className="scene__hint">同学可能会这样问你。点一点，先练习怎么回答。不想回答的问题，也可以说「我现在不想说这个」。</p>
      <div className="school-stage" aria-hidden="true">
        <span className="school-stage__board">欢迎回来</span>
        <span className="school-stage__desk" />
        <CellBuddy kind="red" size={52} className="bob" title="" />
      </div>
      <div className="helper-row" role="group" aria-label="同学的问题">
        {QUESTIONS.map((question) => (
          <button
            key={question.id}
            type="button"
            className="helper-button"
            aria-pressed={active === question.id}
            onClick={() => setActive(question.id)}
          >
            <span className="helper-button__name">「{question.ask}」</span>
            <span className="helper-button__job">点一点练习回答</span>
          </button>
        ))}
      </div>
      <p className="speech" aria-live="polite">
        {current ? `你可以说：${current.answer}` : "点上面的一个问题，看看可以怎么回答。"}
      </p>
    </div>
  );
}
