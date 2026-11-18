import type { ReactNode } from "react";
import type { RecoveryCategory } from "@/src/data/recovery/recovery";

export const RECOVERY_CATEGORY_HUE: Record<RecoveryCategory, string> = {
  感染预防: "var(--hue-mint)",
  口腔与皮肤: "var(--hue-sky)",
  营养与食欲: "var(--hue-sun)",
  疲劳与活动: "var(--hue-leaf)",
  骨骼与关节: "var(--hue-plum)",
  管路护理: "var(--hue-lilac)",
  返校与学习: "var(--hue-coral)",
  疫苗与复诊: "var(--hue-rose)",
  居家环境: "var(--hue-leaf)",
  紧急情况: "var(--hue-coral)",
};

const CATEGORY_ICONS: Record<RecoveryCategory, ReactNode> = {
  感染预防: <path d="M12 3.5 18.5 6v5.2c0 4.1-2.7 7.3-6.5 9.3-3.8-2-6.5-5.2-6.5-9.3V6L12 3.5ZM9 12l2 2 4-4.5" />,
  口腔与皮肤: (
    <path d="M7.2 4.8c1.6 0 2.4.9 4.8.9s3.2-.9 4.8-.9c2 0 3.2 1.8 3.2 4.4 0 3.7-1.6 5.8-2.6 8.3-.6 1.5-1.1 2.1-1.8 2.1-1 0-1-2.6-3.6-2.6s-2.6 2.6-3.6 2.6c-.7 0-1.2-.6-1.8-2.1C5.6 15 4 12.9 4 9.2c0-2.6 1.2-4.4 3.2-4.4Z" />
  ),
  营养与食欲: (
    <>
      <path d="M12 8.2c-1.4-2.1-4.4-2.5-6.1-.4-1.9 2.3-1.4 7.2.8 9.8 1 1.2 2.1 1.8 3 1.3.9-.5 1.7-.5 2.6 0 .9.5 2-.1 3-1.3 2.2-2.6 2.7-7.5.8-9.8-1.7-2.1-4.7-1.7-6.1.4Z" />
      <path d="M12 8V5.5a2 2 0 0 1 2-2" />
    </>
  ),
  疲劳与活动: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  骨骼与关节: (
    <>
      <path d="M8.8 15.2 15.2 8.8" />
      <circle cx="7.4" cy="16.6" r="2.6" />
      <circle cx="16.6" cy="7.4" r="2.6" />
    </>
  ),
  管路护理: (
    <>
      <path d="M5 19c4.5 0 4.5-4 9-4s4.5-4 5-5" />
      <circle cx="19" cy="10" r="1.6" />
      <path d="M8 4.5v4M6 6.5h4" />
    </>
  ),
  返校与学习: (
    <>
      <path d="M4.5 5.5c2.8-1 5.2-.4 7.5.9 2.3-1.3 4.7-1.9 7.5-.9v12.2c-2.8-1-5.2-.4-7.5.9-2.3-1.3-4.7-1.9-7.5-.9V5.5Z" />
      <path d="M12 6.4v12.2" />
    </>
  ),
  疫苗与复诊: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16M12 13v5M9.5 15.5h5" />
    </>
  ),
  居家环境: (
    <path d="M4 11.2 12 4l8 7.2V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-7.8Z" />
  ),
  紧急情况: (
    <>
      <path d="M6.5 16.5h11l-1.4-2.4V10a4.1 4.1 0 0 0-8.2 0v4.1L6.5 16.5Z" />
      <path d="M10 19.2a2.2 2.2 0 0 0 4 0" />
    </>
  ),
};

export function RecoveryCategoryIcon({
  category,
  className = "recovery-icon",
}: {
  category: RecoveryCategory;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CATEGORY_ICONS[category]}
    </svg>
  );
}
