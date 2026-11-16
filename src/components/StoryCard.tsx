import { Link } from "react-router-dom";
import type { Story } from "@/src/data/stories";

export function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return (
    <article className={`story-card story-card--${story.accent}`} id={story.id}>
      <header className="story-card__head">
        <span className="story-avatar" aria-hidden="true">
          {story.name.slice(-1)}
        </span>
        <div className="story-card__identity">
          <h3>{story.name}</h3>
          <p>
            {story.ageLabel} · {story.place}
          </p>
        </div>
        <span className="tag tag--muted">公开报道</span>
      </header>

      <div className="story-card__tags">
        <span>{story.diagnosis}</span>
        <span>{story.phase}</span>
      </div>

      <blockquote className="story-quote">
        “{story.quote}”
        <cite>{story.quoteBy}</cite>
      </blockquote>

      {compact ? (
        <p className="story-card__summary">{story.summary}</p>
      ) : (
        <>
          <div className="story-card__body">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ol className="story-timeline" aria-label={`${story.name}的报道时间线`}>
            {story.timeline.map((item) => (
              <li className="story-timeline__item" key={item.label}>
                <span className="story-timeline__label">{item.label}</span>
                <b>{item.title}</b>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>

          <div className="story-record">
            <h4>{story.record.title}</h4>
            <div className="story-record__flow">
              <span className="story-record__docs">
                {story.record.documents.map((document) => (
                  <span key={document}>{document}</span>
                ))}
              </span>
              <span className="story-record__arrow" aria-hidden="true">
                →
              </span>
              <span className="story-record__entry">{story.record.entry}</span>
            </div>
            <p>{story.record.note}</p>
          </div>

          <div className="story-card__facts">
            <div>
              <h4>报道里提到的需要</h4>
              <ul className="plain-list plain-list--tight">
                {story.needs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>报道里提到的支持</h4>
              <ul className="plain-list plain-list--tight">
                {story.supports.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="story-source">
            <span>
              来源：
              <a href={story.source.url} target="_blank" rel="noreferrer noopener">
                {story.source.name}
              </a>
            </span>
            <span>报道发布 {story.source.publishedAt}</span>
            <span>{story.source.note}</span>
            <span>本站核对 {story.source.verifiedAt}</span>
            <a href={story.source.url} target="_blank" rel="noreferrer noopener">
              打开报道原文
            </a>
          </div>

          <div className="story-card__footer">
            <div className="story-card__tools" aria-label="用到的站内工具">
              {story.tools.map((tool) => (
                <Link key={tool.label} to={tool.to} className="story-tool">
                  {tool.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <Link className="story-card__backtop" to="/stories">
              回到全部故事 <span aria-hidden="true">↑</span>
            </Link>
          </div>
        </>
      )}

      {compact ? (
        <Link className="story-card__more" to={`/stories#${story.id}`}>
          读这个故事 <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </article>
  );
}
