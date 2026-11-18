import { useState } from "react";

const STOPS: { id: string; name: string; line: string }[] = [
  {
    id: "blood",
    name: "查血常规",
    line: "取一点点血，数一数红细胞、白细胞和血小板够不够。护士会很快扎好，可以请大人握着你的手。",
  },
  {
    id: "grow",
    name: "量身高体重",
    line: "看看你长高了没有、吃得怎么样。这也是复查的一部分，跟考试不一样，没有好坏分数。",
  },
  {
    id: "talk",
    name: "和医生聊聊",
    line: "把最近睡觉、吃饭、上学和心情怎么样告诉医生。有不舒服或者担心的事，也可以趁这个时候问。",
  },
  {
    id: "next",
    name: "约下一次复查",
    line: "医生会写在复查单上，大人会记好时间。离治疗结束越久，回来检查的次数一般会越少。",
  },
];

export function FollowupScene() {
  const [active, setActive] = useState<string | null>(null);
  const current = STOPS.find((stop) => stop.id === active);

  return (
    <div className="scene scene--followup">
      <p className="scene__hint">复查那天一般会经过这几站。点一点，先看看每一站会发生什么。</p>
      <ol className="followup-track">
        {STOPS.map((stop, index) => (
          <li key={stop.id}>
            <button
              type="button"
              className="followup-stop"
              aria-pressed={active === stop.id}
              onClick={() => setActive(stop.id)}
            >
              <span className="followup-stop__num" aria-hidden="true">
                {index + 1}
              </span>
              <span>{stop.name}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="speech" aria-live="polite">
        {current ? current.line : "点上面的任意一站，看看复查那天会发生什么。"}
      </p>
    </div>
  );
}
