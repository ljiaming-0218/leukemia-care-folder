import { Link } from "react-router-dom";
import type { KnowledgeCard } from "@/src/domain/schemas";
import { CopyButton } from "@/src/components/CopyButton";
import { SourceLine } from "@/src/components/SourceLine";

export function KnowledgeCardView({ card }: { card: KnowledgeCard }) {
  return (
    <article className="card" id={card.id}>
      <div className="card__head">
        <span className="tag tag--accent">{card.topic}</span>
      </div>
      <h2 className="card__title">{card.title}</h2>
      <p className="card__body">{card.summary}</p>
      {card.details.length > 0 ? (
        <div className="card__details">
          {card.details.map((detail) => (
            <section key={detail.heading} className="card__detail">
              <h3 className="subhead">{detail.heading}</h3>
              {detail.paragraphs.map((paragraph) => (
                <p className="card__body" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {detail.bullets.length > 0 ? (
                <ul className="plain-list plain-list--tight card__detail-list">
                  {detail.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
      <p className="subhead">适用范围</p>
      <p className="card__body" style={{ fontSize: "0.9375rem", color: "var(--site-muted)" }}>
        {card.applicability}
      </p>
      <div className="btn-row">
        {card.action.kind === "copy" ? (
          <CopyButton text={card.action.text ?? ""}>{card.action.label}</CopyButton>
        ) : (
          <Link className="btn btn--ghost" to={card.action.to ?? "/"}>
            {card.action.label}
          </Link>
        )}
      </div>
      <SourceLine
        name={card.sourceName}
        url={card.sourceUrl}
        extraLinks={card.extraLinks}
        publishedAt={card.publishedAt}
        verifiedAt={card.verifiedAt}
        note={card.sourceNote}
      />
    </article>
  );
}
