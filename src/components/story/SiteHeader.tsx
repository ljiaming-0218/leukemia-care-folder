import { NavLink } from "react-router-dom";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { setMotion, useMotion } from "@/src/lib/motion";
import { setVoiceOn, useVoiceOn } from "@/src/lib/voice";
import { SITE_NAME } from "@/src/lib/usePageTitle";

const NAV = [
  { to: "/", label: "故事地图", end: true },
  { to: "/explore", label: "身体探险", end: false },
  { to: "/stories", label: "同路人", end: false },
  { to: "/recovery", label: "康复建议", end: false },
  { to: "/feelings", label: "心里话", end: false },
  { to: "/words", label: "词语卡", end: false },
];

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      {on ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l4 6M21 9l-4 6" />}
    </svg>
  );
}

function MotionIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      {on ? <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /> : <path d="M4 12h16" />}
    </svg>
  );
}

export function SiteHeader() {
  const motion = useMotion();
  const on = motion === "full";
  const voiceOn = useVoiceOn();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand" aria-label={`${SITE_NAME}，回到故事地图`}>
          <CellBuddy kind="red" size={36} title="" />
          <span className="brand__text">
            <span className="brand__name">{SITE_NAME}</span>
            <span className="brand__tag">讲给孩子听的白血病</span>
          </span>
        </NavLink>
        <nav aria-label="主导航" className="site-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "site-nav__link active" : "site-nav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-toggles">
          <button
            type="button"
            className="motion-toggle"
            aria-pressed={voiceOn}
            aria-label={voiceOn ? "关闭朗读声音" : "打开朗读声音"}
            title="朗读声音：点热点、读漫画时会用少女音读给你听"
            onClick={() => setVoiceOn(!voiceOn)}
          >
            <SoundIcon on={voiceOn} />
            <span className="motion-toggle__label">声音</span>
          </button>
          <button
            type="button"
            className="motion-toggle"
            aria-pressed={on}
            aria-label={on ? "关闭动画" : "打开动画"}
            title="动画：关闭后暂停漂浮和自动效果，不影响 3D"
            onClick={() => setMotion(on ? "reduce" : "full")}
          >
            <MotionIcon on={on} />
            <span className="motion-toggle__label">动画</span>
          </button>
        </div>
      </div>
    </header>
  );
}
