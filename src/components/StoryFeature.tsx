import { Link } from "react-router-dom";
import type { Story } from "@/src/data/stories";

export function StoryFeature({
  story,
  order,
  total,
}: {
  story: Story;
  order: number;
  total: number;
}) {
  return (
    <article
      className={`story-feature story-feature--${story.accent}`}
      aria-labelledby={`story-${story.id}-title`}
    >
      <span className="story-feature__number" aria-hidden="true">
        {String(order).padStart(2, "0")}
      </span>

      <header className="story-feature__head">
        <p className="story-feature__kicker">
          公开报道 · 第 {order} 篇 / 共 {total} 篇
        </p>
        <h3 className="story-feature__title" id={`story-${story.id}-title`}>
          {story.name}
        </h3>
        <p className="story-feature__meta">
          <span>{story.ageLabel}</span>
          <span>{story.place}</span>
        </p>
        <p className="story-feature__meta story-feature__meta--diagnosis">
          <span>{story.diagnosis}</span>
          <span>{story.phase}</span>
        </p>
        <p className="story-feature__themes" aria-label="主题">
          {story.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </p>
        <p className="story-feature__summary">{story.summary}</p>
      </header>

      <blockquote className="story-feature__quote">
        <p>“{story.quote}”</p>
        <cite>{story.quoteBy}</cite>
      </blockquote>

      <div className="story-feature__grid">
        <div className="story-feature__main">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <div className="story-feature__facts">
            <section>
              <h4>报道里提到的需要</h4>
              <ul className="plain-list plain-list--tight">
                {story.needs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4>报道里提到的支持</h4>
              <ul className="plain-list plain-list--tight">
                {story.supports.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <aside className="story-feature__aside" aria-label={`${story.name}的报道时间线与费用线索`}>
          <h4 className="story-feature__aside-title">报道时间线</h4>
          <ol className="story-feature__timeline">
            {story.timeline.map((item) => (
              <li key={item.label}>
                <span className="story-feature__timeline-label">{item.label}</span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="story-feature__record">
            <h4>{story.record.title}</h4>
            <p className="story-feature__record-flow">
              <span>{story.record.documents.join("、")}</span>
              <span aria-hidden="true">→</span>
              <b>{story.record.entry}</b>
            </p>
            <p className="story-feature__record-note">{story.record.note}</p>
          </div>
        </aside>
      </div>

      <footer className="story-feature__footer">
        <div className="story-feature__source">
          <span>
            来源：
            <a href={story.source.url} target="_blank" rel="noreferrer noopener">
              {story.source.name}
            </a>
          </span>
          <span>
            报道发布 {story.source.publishedAt} · 本站核对 {story.source.verifiedAt}
          </span>
          <span>{story.source.note}</span>
          <a href={story.source.url} target="_blank" rel="noreferrer noopener">
            打开报道原文
          </a>
        </div>
        <div className="story-feature__tools">
          <span>接着做</span>
          {story.tools.map((tool) => (
            <Link key={tool.label} to={tool.to}>
              {tool.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </footer>
    </article>
  );
}
