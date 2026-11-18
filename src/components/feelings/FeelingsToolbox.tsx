import type { CSSProperties } from "react";
import { feelingTools, type FeelingToolId } from "@/src/data/feelings/feelings";
import { FEELING_TOOL_HUE, FEELING_TOOL_LABEL, FeelingToolIcon } from "./toolMeta";

export function FeelingsToolbox({
  active,
  panelId,
  onSelect,
}: {
  active: FeelingToolId;
  panelId: string;
  onSelect: (id: FeelingToolId) => void;
}) {
  return (
    <div className="feelings-toolbox" id="feelings-toolbox" role="group" aria-label="选择一个小工具">
      {feelingTools.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            className={selected ? "feelings-toolbox__tool is-active" : "feelings-toolbox__tool"}
            style={{ "--tool-hue": FEELING_TOOL_HUE[item.id] } as CSSProperties}
            aria-pressed={selected}
            aria-controls={panelId}
            aria-label={`${item.title}：${item.intro}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="feelings-toolbox__icon" aria-hidden="true">
              <FeelingToolIcon id={item.id} />
            </span>
            <span className="feelings-toolbox__label">{FEELING_TOOL_LABEL[item.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
