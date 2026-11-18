import { FEELING_ENTRIES, type FeelingEntryId } from "@/src/data/feelings/feelings";

export function FeelingPicker({
  selected,
  panelId,
  onSelect,
}: {
  selected: FeelingEntryId | null;
  panelId: string;
  onSelect: (id: FeelingEntryId) => void;
}) {
  return (
    <div className="feeling-picker">
      <p className="feeling-picker__label" id="feeling-picker-label">
        此刻最像哪个？点一个，帮你挑工具。
      </p>
      <div className="feeling-picker__options" role="group" aria-labelledby="feeling-picker-label">
        {FEELING_ENTRIES.map((entry) => {
          const active = entry.id === selected;
          return (
            <button
              key={entry.id}
              type="button"
              className={active ? "feeling-picker__option is-active" : "feeling-picker__option"}
              aria-pressed={active}
              aria-controls={panelId}
              aria-label={active ? `${entry.label}，已选择，再点一次取消` : entry.label}
              onClick={() => onSelect(entry.id)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
