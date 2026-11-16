import { Link } from "react-router-dom";
import type { Story } from "@/src/data/stories";

export function StoryCard({
  story,
  order,
  active = false,
}: {
  story: Story;
  order?: number;
  active?: boolean;
}) {
  return (
    <article
      className={`story-card story-card--${story.accent}${active ? " story-card--active" : ""}`}
    >
      <Link
        className="story-card__hit"
        to={`/stories#${story.id}`}
        aria-label={`读${story.name}的故事`}
        aria-current={active ? "true" : undefined}
      />

      {order !== undefined ? (
        <span className="story-card__no" aria-hidden="true">
          {String(order).padStart(2, "0")}
        </span>
      ) : null}

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
      </header>

      <div className="story-card__tags">
        <span>{story.diagnosis}</span>
        <span>{story.phase}</span>
      </div>

      <blockquote className="story-quote">
        “{story.quote}”
        <cite>{story.quoteBy}</cite>
      </blockquote>

      <p className="story-card__summary">{story.summary}</p>

      <div className="story-card__themes" aria-label="主题">
        {story.themes.map((theme) => (
          <span key={theme}>{theme}</span>
        ))}
      </div>

      <footer className="story-card__foot">
        <span className="story-card__source">
          {story.source.name} · {story.source.publishedAt}
        </span>
        <span className="story-card__more">
          {active ? "正在读" : "读这个故事"} <span aria-hidden="true">→</span>
        </span>
      </footer>
    </article>
  );
}
