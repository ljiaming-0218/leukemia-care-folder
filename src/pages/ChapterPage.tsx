import { Link, Navigate, useParams } from "react-router-dom";
import { ComicReader } from "@/src/components/comic/ComicReader";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { chapterIcon } from "@/src/components/story/chapterIcon";
import { Scene } from "@/src/components/story/Scene";
import { SourceList } from "@/src/components/story/SourceList";
import { chapters, getChapter } from "@/src/data/story/chapters";
import { getComicPanels } from "@/src/data/comics/panels";
import { feelingTools } from "@/src/data/feelings/feelings";
import { recoveryTips } from "@/src/data/recovery/recovery";
import { words } from "@/src/data/story/words";
import { addSticker, useStickers } from "@/src/lib/stickers";
import { usePageTitle } from "@/src/lib/usePageTitle";

export default function ChapterPage() {
  const { id } = useParams();
  const chapter = getChapter(id);
  usePageTitle(chapter ? `第 ${chapter.number} 章 ${chapter.title}` : "故事地图");
  const stickers = useStickers();

  if (!chapter) return <Navigate to="/" replace />;

  const index = chapters.indexOf(chapter);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const done = stickers.includes(chapter.id);
  const related = words.filter((word) => word.chapterId === chapter.id);
  const panels = getComicPanels(chapter.id);
  const moreCount = chapter.recoveryTipIds.length + chapter.feelingToolIds.length;

  const jumpLinks: { id: string; label: string; meta?: string }[] = [];
  if (panels.length > 0) jumpLinks.push({ id: "chapter-comic", label: "动态漫画", meta: `${panels.length} 格` });
  if (chapter.kidText.length > 0) jumpLinks.push({ id: "chapter-text", label: "再慢慢读一遍" });
  jumpLinks.push({ id: "chapter-try", label: "动手试一试" });
  jumpLinks.push({ id: "chapter-remember", label: "记住这一句" });
  if (related.length > 0) jumpLinks.push({ id: "chapter-words", label: "这一章的新词", meta: `${related.length} 个` });
  if (moreCount > 0) jumpLinks.push({ id: "chapter-more", label: "读完还可以" });
  jumpLinks.push({ id: "chapter-grownups", label: "大人看这里" });

  function jumpTo(id: string) {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    node.setAttribute("tabindex", "-1");
    node.focus({ preventScroll: true });
  }

  return (
    <article className={`page page--chapter hue-${chapter.hue}`} key={chapter.id}>
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>
      <header className="chapter-head">
        <span className="chapter-head__icon" aria-hidden="true">
          <CellBuddy kind={chapterIcon(chapter.scene)} size={72} className="bob" title="" />
        </span>
        <div>
          <p className="chapter-head__num">
            第 {chapter.number} 章 / 共 {chapters.length} 章
          </p>
          <h1 className="chapter-head__title">{chapter.title}</h1>
          <p className="chapter-head__teaser">{chapter.teaser}</p>
        </div>
      </header>

      {chapter.contentWarning && (
        <p className="content-warning" role="note">
          {chapter.contentWarning}
        </p>
      )}

      <div className="chapter-body">
        <div className="chapter-main">
          {panels.length > 0 && (
            <div className="chapter-comic" id="chapter-comic">
              <ComicReader panels={panels} chapterId={chapter.id} hueClass={`hue-${chapter.hue}`} />
            </div>
          )}

          <section className="story-text" id="chapter-text" aria-label="再慢慢读一遍">
            {panels.length > 0 && <h2 className="story-text__title">再慢慢读一遍</h2>}
            {chapter.kidText.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section className="scene-box" id="chapter-try" aria-label="动手试一试">
            <Scene scene={chapter.scene} />
            {chapter.scene3dId && (
              <Link
                className="primary-button scene-box__dive"
                to={`/explore?scene=${chapter.scene3dId}&back=${encodeURIComponent(`/story/${chapter.id}`)}`}
              >
                进身体看看（3D）
              </Link>
            )}
          </section>

          <section className="remember" id="chapter-remember" aria-labelledby="remember-title">
            <h2 id="remember-title">记住这一句</h2>
            <p className="remember__line">{chapter.remember}</p>
            {done ? (
              <p className="sticker-done">
                <span aria-hidden="true">★</span> 这一章的贴纸已经拿到了
              </p>
            ) : (
              <button type="button" className="primary-button sticker-button" onClick={() => addSticker(chapter.id)}>
                我读完了，领一张贴纸
              </button>
            )}
            <p className="sr-only" aria-live="polite">
              {done ? `已收集第 ${chapter.number} 章贴纸` : ""}
            </p>
          </section>

          {related.length > 0 && (
            <section className="chapter-words" id="chapter-words" aria-labelledby="words-title">
              <h2 id="words-title">这一章的新词</h2>
              <ul>
                {related.map((word) => (
                  <li key={word.id}>
                    <Link to={`/words#${word.id}`}>{word.term}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {moreCount > 0 && (
            <section className="chapter-more" id="chapter-more" aria-labelledby="chapter-more-title">
              <h2 id="chapter-more-title">读完这一章，还可以</h2>
              <div className="button-row">
                {chapter.recoveryTipIds.map((tipId) => {
                  const tip = recoveryTips.find((item) => item.id === tipId);
                  return tip ? (
                    <Link key={tipId} to={`/recovery#${tip.id}`} className="text-button">
                      康复：{tip.title}
                    </Link>
                  ) : null;
                })}
                {chapter.feelingToolIds.map((toolId) => {
                  const tool = feelingTools.find((item) => item.id === toolId);
                  return tool ? (
                    <Link key={toolId} to={`/feelings#feelings-${tool.id}`} className="text-button">
                      心里话：{tool.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </section>
          )}

          <details className="grown-up-box" id="chapter-grownups">
            <summary>大人看这里：这一章依据什么写的</summary>
            <ul className="grown-up-box__points">
              {chapter.grownUp.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="grown-up-box__boundary">{chapter.grownUp.boundary}</p>
            <h3>来源</h3>
            <SourceList ids={chapter.sourceIds} />
          </details>

          <nav className="chapter-nav" aria-label="章节翻页">
            {prev ? (
              <Link to={`/story/${prev.id}`} className="text-button">
                上一章：{prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/story/${next.id}`} className="primary-button">
                下一章：{next.title}
              </Link>
            ) : (
              <Link to="/" className="primary-button">
                回到故事地图
              </Link>
            )}
          </nav>
        </div>

        <aside className="chapter-aside" aria-label="本章导航">
          <p className="chapter-aside__eyebrow">这一章</p>
          <p className="chapter-aside__teaser">{chapter.teaser}</p>
          <nav className="chapter-aside__nav" aria-label="跳到本章内容">
            {jumpLinks.map((link) => (
              <button key={link.id} type="button" className="chapter-aside__link" onClick={() => jumpTo(link.id)}>
                <span>{link.label}</span>
                {link.meta && <span className="chapter-aside__meta">{link.meta}</span>}
              </button>
            ))}
          </nav>
          <p className="chapter-aside__sticker">
            {done ? "★ 这一章的贴纸已到手" : "读完这一章，可以领一张贴纸"}
          </p>
          <p className="chapter-aside__hint">一次读一格也没关系，累了就停下来，叫大人陪你一起读。</p>
        </aside>
      </div>
    </article>
  );
}
