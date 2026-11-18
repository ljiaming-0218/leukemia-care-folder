import { CellBuddy } from "@/src/components/story/CellBuddy";

export function RecoveryGarden() {
  return (
    <div className="recovery-garden" aria-hidden="true">
      <svg className="recovery-garden__scene" viewBox="0 0 360 240" role="presentation">
        <defs>
          <linearGradient id="recovery-garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--hue-sky)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--site-surface)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="recovery-garden-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--hue-leaf)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--hue-mint)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <rect width="360" height="240" rx="24" fill="var(--site-surface)" />
        <rect width="360" height="240" rx="24" fill="url(#recovery-garden-sky)" />

        <circle cx="292" cy="54" r="40" fill="var(--hue-sun)" opacity="0.16" />
        <circle cx="292" cy="54" r="27" fill="var(--hue-sun)" opacity="0.82" />

        <path d="M86 38h44a12 12 0 0 1 0 24H86a12 12 0 0 1 0-24Z" fill="var(--site-surface)" opacity="0.85" />
        <path d="M124 52h30a10 10 0 0 1 0 20h-30a10 10 0 0 1 0-20Z" fill="var(--site-surface)" opacity="0.6" />

        <g stroke="var(--site-border-strong)" strokeWidth="2" opacity="0.75">
          <path d="M286 176v30M306 176v30M326 176v30" />
          <path d="M278 186h56M278 198h56" />
        </g>

        <g>
          <rect x="44" y="150" width="9" height="38" rx="4.5" fill="var(--cell-ink)" opacity="0.28" />
          <circle cx="49" cy="136" r="23" fill="var(--hue-leaf)" opacity="0.8" />
          <circle cx="30" cy="145" r="15" fill="var(--hue-mint)" opacity="0.85" />
          <circle cx="67" cy="145" r="14" fill="var(--hue-mint)" opacity="0.75" />
        </g>

        <path d="M0 168c44-30 86-32 126-14s86 22 128-6 74-24 106-10v102H0Z" fill="var(--hue-leaf)" opacity="0.3" />
        <path d="M0 196c50-20 92-18 132 0s90 18 132-2 62-16 96-8v54H0Z" fill="url(#recovery-garden-ground)" />

        <g stroke="var(--cell-ink)" strokeOpacity="0.28" strokeWidth="2.4" strokeLinecap="round">
          <path d="M118 200v-34" />
          <path d="M178 204v-44" />
          <path d="M246 200v-30" />
        </g>

        <g>
          <path d="M118 180c-12-2-18-9-18-17 10 0 17 6 18 17Z" fill="var(--hue-mint)" opacity="0.9" />
          <circle cx="118" cy="158" r="8" fill="var(--hue-coral)" />
          <circle cx="107" cy="150" r="5.5" fill="var(--hue-rose)" />
          <circle cx="129" cy="150" r="5.5" fill="var(--hue-sun)" />
        </g>
        <g>
          <path d="M178 186c12-2 18-9 18-17-10 0-17 6-18 17Z" fill="var(--hue-mint)" opacity="0.9" />
          <circle cx="178" cy="160" r="9" fill="var(--hue-lilac)" />
          <circle cx="166" cy="152" r="6" fill="var(--hue-sky)" />
          <circle cx="190" cy="152" r="6" fill="var(--hue-sky)" />
        </g>
        <g>
          <path d="M246 182c-11-2-16-8-16-15 9 0 15 5 16 15Z" fill="var(--hue-mint)" opacity="0.9" />
          <circle cx="246" cy="168" r="8" fill="var(--hue-sun)" />
          <circle cx="235" cy="160" r="5.5" fill="var(--hue-rose)" />
          <circle cx="257" cy="160" r="5.5" fill="var(--hue-coral)" />
        </g>

        <g fill="var(--hue-leaf)" opacity="0.55">
          <circle cx="30" cy="206" r="4" />
          <circle cx="86" cy="212" r="3.5" />
          <circle cx="146" cy="210" r="4" />
          <circle cx="212" cy="212" r="3.5" />
          <circle cx="270" cy="208" r="4" />
          <circle cx="332" cy="204" r="3.5" />
        </g>

        <g stroke="var(--site-fg)" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M228 84c-5-6-12-4-12 2s7 8 12 2Z" fill="var(--hue-rose)" fillOpacity="0.8" stroke="none" />
          <path d="M228 84c5-6 12-4 12 2s-7 8-12 2Z" fill="var(--hue-coral)" fillOpacity="0.8" stroke="none" />
          <path d="M224 90c-3 3-3 6-1 8" />
          <path d="M252 106c-4-5-10-3-10 2s6 7 10 2Z" fill="var(--hue-sun)" fillOpacity="0.9" stroke="none" />
          <path d="M252 106c4-5 10-3 10 2s-6 7-10 2Z" fill="var(--hue-sun)" fillOpacity="0.7" stroke="none" />
        </g>
      </svg>

      <span className="recovery-garden__buddy recovery-garden__buddy--stem">
        <CellBuddy kind="stem" size={72} title="" />
      </span>
      <span className="recovery-garden__buddy recovery-garden__buddy--platelet">
        <CellBuddy kind="platelet" size={46} title="" />
      </span>
    </div>
  );
}
