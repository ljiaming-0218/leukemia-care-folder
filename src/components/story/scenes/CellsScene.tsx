import { useState } from "react";
import { CellBuddy, type CellKind } from "@/src/components/story/CellBuddy";

const HELPERS: { kind: Extract<CellKind, "red" | "white" | "platelet">; name: string; job: string; line: string }[] = [
  {
    kind: "red",
    name: "红细胞",
    job: "送货员",
    line: "我是红细胞！我背着氧气，送到你身体的每个角落。我少了的时候，你会觉得很累。",
  },
  {
    kind: "white",
    name: "白细胞",
    job: "小卫士",
    line: "我是白细胞！病菌闯进来，我就去打败它们。我少了的时候，你更容易发烧生病。",
  },
  {
    kind: "platelet",
    name: "血小板",
    job: "修补工",
    line: "我是血小板！哪里有小伤口，我就赶过去帮忙止血。我少了的时候，身上容易青一块。",
  },
];

export function CellsScene() {
  const [active, setActive] = useState<CellKind | null>(null);
  const current = HELPERS.find((helper) => helper.kind === active);

  return (
    <div className="scene scene--cells">
      <div className="bloodstream" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className={`drift drift--${index % 3}`} style={{ animationDelay: `calc(${-index * 1.3}s * var(--site-motion))`, top: `${8 + ((index * 29) % 64)}%`, left: `${index * 11}%` }}>
            <CellBuddy kind={HELPERS[index % 3].kind} size={34} />
          </span>
        ))}
      </div>
      <div className="helper-row" role="group" aria-label="点一点小帮手">
        {HELPERS.map((helper) => (
          <button
            key={helper.kind}
            type="button"
            className="helper-button"
            aria-pressed={active === helper.kind}
            onClick={() => setActive(helper.kind)}
          >
            <CellBuddy kind={helper.kind} size={84} className="bob" title="" />
            <span className="helper-button__name">{helper.name}</span>
            <span className="helper-button__job">{helper.job}</span>
          </button>
        ))}
      </div>
      <p className="speech" aria-live="polite">
        {current ? current.line : "点上面任意一个小帮手，它会跟你打招呼。"}
      </p>
    </div>
  );
}
