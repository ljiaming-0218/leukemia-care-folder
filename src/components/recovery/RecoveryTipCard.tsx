import type { CSSProperties } from "react";
import { sources } from "@/src/data/story/sources";
import type { RecoveryTip } from "@/src/data/recovery/recovery";
import { toggleAsked, useAskedDoctor } from "@/src/lib/askedDoctor";
import { RECOVERY_CATEGORY_HUE, RecoveryCategoryIcon } from "./recoveryMeta";

const sourceById = new Map(sources.map((source) => [source.id, source]));

export function RecoveryTipCard({ tip }: { tip: RecoveryTip }) {
  const asked = useAskedDoctor();
  const isAlert = tip.category === "紧急情况";

  return (
    <article
      id={tip.id}
      className={isAlert ? "recovery-card is-alert" : "recovery-card"}
      style={{ "--tip-hue": RECOVERY_CATEGORY_HUE[tip.category] } as CSSProperties}
    >
      <header className="recovery-card__head">
        <span className="recovery-card__icon" aria-hidden="true">
          <RecoveryCategoryIcon category={tip.category} />
        </span>
        <div>
          <p className="recovery-card__category">{tip.category}</p>
          <h2 className="recovery-card__title">{tip.title}</h2>
          <ul className="recovery-card__stages" aria-label="适用阶段">
            {tip.stages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </header>

      <div className="recovery-card__body">
        <div className="recovery-card__section is-do">
          <h3>
            <span className="recovery-card__mark" aria-hidden="true">
              ✓
            </span>
            可以做什么
          </h3>
          <ul>
            {tip.do.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="recovery-card__section is-dont">
          <h3>
            <span className="recovery-card__mark" aria-hidden="true">
              ×
            </span>
            不要做什么
          </h3>
          <ul>
            {tip.dont.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="recovery-card__section is-call">
          <h3>
            <span className="recovery-card__mark" aria-hidden="true">
              !
            </span>
            什么时候联系医院
          </h3>
          <ul>
            {tip.whenToCall.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="recovery-card__foot">
        <label className="asked-check">
          <input type="checkbox" checked={asked.includes(tip.id)} onChange={() => toggleAsked(tip.id)} />
          已经问过医生
        </label>

        <p className="recovery-card__source">
          <span>
            来源：
            {tip.sourceIds.map((id) => {
              const source = sourceById.get(id);
              return source ? (
                <a key={id} href={source.url} target="_blank" rel="noreferrer">
                  {source.publisher}
                </a>
              ) : null;
            })}
          </span>
          <span>核对日期 {tip.verifiedAt}</span>
        </p>
      </footer>
    </article>
  );
}
