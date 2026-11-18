import { NavLink } from "react-router-dom";
import { CellBuddy, type CellKind } from "@/src/components/story/CellBuddy";

const TABS: { to: string; label: string; icon?: CellKind; glyph?: "words"; end?: boolean }[] = [
  { to: "/", label: "故事", icon: "red", end: true },
  { to: "/explore", label: "身体", icon: "blast" },
  { to: "/stories", label: "同路人", icon: "stem" },
  { to: "/recovery", label: "康复", icon: "platelet" },
  { to: "/feelings", label: "心里话", icon: "white" },
  { to: "/words", label: "词语", glyph: "words" },
];

function WordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className="site-tabbar__word-icon"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5" width="14" height="14" rx="3" />
      <path d="M7 8.6h6" />
      <circle cx="8.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12.4" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8.4 14.4q2.1 1.7 4.2 0" />
      <path d="M17.5 8.5H19a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 8.5 18v-1" />
    </svg>
  );
}

export function SiteTabBar() {
  return (
    <nav className="site-tabbar" aria-label="主要页面">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => (isActive ? "site-tabbar__link is-active" : "site-tabbar__link")}
        >
          {tab.glyph === "words" ? <WordIcon /> : tab.icon ? <CellBuddy kind={tab.icon} size={26} title="" /> : null}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
