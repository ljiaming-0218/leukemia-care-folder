import type { FeelingToolId } from "@/src/data/feelings/feelings";

export const FEELING_TOOL_LABEL: Record<FeelingToolId, string> = {
  weather: "天气",
  breathing: "呼吸",
  "not-your-fault": "不是你的错",
  "question-card": "问题卡",
  "courage-sticker": "勇气",
  sibling: "手足",
  "school-theater": "小剧场",
};

export const FEELING_TOOL_HUE: Record<FeelingToolId, string> = {
  weather: "var(--hue-sun)",
  breathing: "var(--hue-sky)",
  "not-your-fault": "var(--hue-coral)",
  "question-card": "var(--hue-lilac)",
  "courage-sticker": "var(--hue-rose)",
  sibling: "var(--hue-plum)",
  "school-theater": "var(--hue-mint)",
};

export function FeelingToolIcon({ id, className }: { id: FeelingToolId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "weather" && (
        <>
          <circle cx="9" cy="9" r="3.2" />
          <path d="M9 3.4v1.4M9 13.3v1.4M3.4 9h1.4M13.3 9h1.4M5 5l1 1M12 12l1 1M13 5l-1 1M6 12l-1 1" />
          <path d="M12.4 18.6h5.1a2.4 2.4 0 0 0 .2-4.7 3.2 3.2 0 0 0-6-.5 2.7 2.7 0 0 0 .7 5.2Z" />
        </>
      )}
      {id === "breathing" && (
        <>
          <circle cx="10" cy="10.6" r="5.2" />
          <circle cx="17.2" cy="7.8" r="2.1" />
          <circle cx="17.3" cy="16.4" r="1.4" />
        </>
      )}
      {id === "not-your-fault" && (
        <>
          <path d="M12 19.2s-6.6-4-6.6-8.2a3.7 3.7 0 0 1 6.6-2.1 3.7 3.7 0 0 1 6.6 2.1c0 4.2-6.6 8.2-6.6 8.2Z" />
          <path d="m9.6 11.3 1.6 1.6 3.2-3.2" />
        </>
      )}
      {id === "question-card" && (
        <>
          <rect x="4.5" y="3.8" width="15" height="16.4" rx="3" />
          <path d="M9.2 9.1a2.8 2.8 0 1 1 4.1 2.5c-.8.4-1.3 1-1.3 1.8" />
          <path d="M12 16.5h.01M8 18h5" />
        </>
      )}
      {id === "courage-sticker" && (
        <>
          <path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.6Z" />
          <path d="M18.8 3.8v2.4M17.6 5h2.4" />
        </>
      )}
      {id === "sibling" && (
        <>
          <circle cx="8.2" cy="8" r="2.5" />
          <path d="M3.8 19c0-2.7 2-4.8 4.4-4.8s4.4 2.1 4.4 4.8" />
          <circle cx="16.6" cy="9.4" r="2" />
          <path d="M13.4 18.6c0-2.2 1.5-3.9 3.2-3.9 1.8 0 3.2 1.7 3.2 3.9" />
        </>
      )}
      {id === "school-theater" && (
        <>
          <path d="M5 4.5h8.5A2.5 2.5 0 0 1 16 7v3.5a2.5 2.5 0 0 1-2.5 2.5H9.5L6 16v-3H5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 5 4.5Z" />
          <path d="M12.5 12.5h5a2.2 2.2 0 0 1 2.2 2.2v1.6a2.2 2.2 0 0 1-2.2 2.2h-2.2l-2.8 2v-2h-.2a2.2 2.2 0 0 1-2.2-2.2v-1.6a2.2 2.2 0 0 1 2.2-2.2Z" />
        </>
      )}
    </svg>
  );
}
