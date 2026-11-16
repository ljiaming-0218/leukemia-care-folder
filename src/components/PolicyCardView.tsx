import type { PolicyResource } from "@/src/domain/schemas";
import { SourceLine } from "@/src/components/SourceLine";

export function PolicyCardView({ resource }: { resource: PolicyResource }) {
  return (
    <article
      className={`card resource-card${resource.isArchived ? " resource-card--archived" : ""}`}
      id={resource.id}
    >
      <div className="card__head">
        <span className="tag tag--accent">{resource.region}</span>
        <span className="tag">{resource.category}</span>
        {resource.alsoCovers.map((extra) => (
          <span className="tag tag--muted" key={extra}>
            也涉及：{extra}
          </span>
        ))}
        {resource.isArchived ? <span className="tag tag--warm">历史资料</span> : null}
      </div>
      <h2 className="card__title">{resource.title}</h2>
      <p className="meta-line">
        <span>发布机构：{resource.issuer}</span>
        <span>适用：{resource.applicability}</span>
      </p>
      <p className="card__body" style={{ marginTop: 10 }}>
        {resource.summary}
      </p>

      <div className="summary-block">
        <b>办理入口</b>
        {resource.entryText}
      </div>

      {resource.confirmQuestions.length > 0 ? (
        <>
          <p className="subhead">需要向经办方确认</p>
          <ul className="plain-list plain-list--tight">
            {resource.confirmQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </>
      ) : null}

      {resource.details.length > 0 ? (
        <div className="card__details">
          {resource.details.map((detail) => (
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

      {resource.extraLinks.length > 0 ? (
        <>
          <p className="subhead">相关原文</p>
          <ul className="plain-list plain-list--tight">
            {resource.extraLinks.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SourceLine
        name={resource.sourceNote ?? resource.title}
        url={resource.sourceUrl}
        publishedAt={resource.publishedAt}
        verifiedAt={resource.verifiedAt}
      />
    </article>
  );
}
