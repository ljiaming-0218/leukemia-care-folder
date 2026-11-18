import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { chapters } from "@/src/data/story/chapters";
import { PEER_THEMES, peerStories, type PeerTheme } from "@/src/data/peers/peers";
import { detectWebGL } from "@/src/components/three/webgl";
import { Scene3DBoundary } from "@/src/components/three/Scene3DBoundary";
import { useMotion } from "@/src/lib/motion";
import { speak, stopSpeaking } from "@/src/lib/voice";
import { usePageTitle } from "@/src/lib/usePageTitle";

const PeersBookshelfCanvas = lazy(() => import("@/src/components/three/PeersBookshelfCanvas"));

type Filter = PeerTheme | "全部";

const FILTERS: Filter[] = ["全部", ...PEER_THEMES];

const THEME_TONE: Record<PeerTheme, string> = {
  刚确诊: "diagnosis",
  异地就医: "travel",
  治疗与随访: "treatment",
  返校与手足: "school",
};

const POWER_KEY = "marrow-factory:peers-power";

function readPowerSaving(): boolean {
  try {
    return localStorage.getItem(POWER_KEY) === "on";
  } catch {
    return false;
  }
}

function BookRail({
  stories,
  activeId,
  onChoose,
}: {
  stories: typeof peerStories;
  activeId: string | null;
  onChoose: (id: string) => void;
}) {
  return (
    <>
      <div className="bookshelf__rail" role="group" aria-label="同路人书架">
        {stories.map((story) => {
          const open = story.id === activeId;
          return (
            <button
              key={story.id}
              type="button"
              className={`book book--${THEME_TONE[story.themes[0]]}${open ? " is-open" : ""}`}
              aria-pressed={open}
              title={story.title}
              onClick={() => onChoose(story.id)}
            >
              <span className="book__theme">{story.themes[0]}</span>
              <span className="book__title">{story.title}</span>
            </button>
          );
        })}
      </div>
      <div className="bookshelf__plank" aria-hidden="true" />
      <p className="bookshelf__hint">左右滑一滑，选一本书</p>
    </>
  );
}

export default function PeersPage() {
  usePageTitle("同路人");
  const [filter, setFilter] = useState<Filter>("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const motion = useMotion();
  const webgl = useMemo(() => detectWebGL(), []);
  const [powerSaving, setPowerSaving] = useState(readPowerSaving);
  const reduced = motion === "reduce";
  const show3D = webgl && !powerSaving;

  const readerRef = useRef<HTMLElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);

  const filtered = filter === "全部" ? peerStories : peerStories.filter((story) => story.themes.includes(filter));
  const active = selectedId ? filtered.find((story) => story.id === selectedId) ?? null : null;

  const shelfBooks = useMemo(
    () =>
      (filter === "全部" ? peerStories : peerStories.filter((story) => story.themes.includes(filter))).map((story) => ({
        id: story.id,
        title: story.title,
        theme: story.themes[0] as string,
      })),
    [filter],
  );

  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function chooseFilter(next: Filter) {
    setFilter(next);
    setSelectedId(null);
    stopSpeaking();
  }

  function chooseStory(id: string) {
    stopSpeaking();
    if (selectedId === id) {
      closeBook();
      return;
    }
    setSelectedId(id);
    window.setTimeout(
      () => {
        readerRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      },
      show3D ? 360 : 0,
    );
  }

  function closeBook() {
    stopSpeaking();
    setSelectedId(null);
    requestAnimationFrame(() => {
      shelfRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    });
  }

  function togglePowerSaving() {
    const next = !powerSaving;
    setPowerSaving(next);
    try {
      localStorage.setItem(POWER_KEY, next ? "on" : "off");
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
  }

  function readStory() {
    if (!active) return;
    speak(
      `${active.title}。当时最怕什么：${active.feared.join(" ")} 最想听到什么：${active.wanted.join(" ")} 后来怎么走过：${active.walked.join(" ")} 给同路人的一句话：${active.message}`,
    );
  }

  const rail = <BookRail stories={filtered} activeId={active?.id ?? null} onChoose={chooseStory} />;

  return (
    <div className="page page--peers">
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>

      <header className="chapter-head">
        <div>
          <p className="chapter-head__num">真实同路人</p>
          <h1 className="chapter-head__title">别人家走过的路</h1>
        </div>
      </header>
      <p className="page-lead">
        这些故事来自已经公开发表的报道，讲一家人当时最怕什么、最想听到什么、后来怎么走过。每个孩子的治疗都不一样，请听自己医生的。
      </p>

      <div className="peer-filters" role="group" aria-label="按主题筛选故事">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === filter ? "filter-chip is-active" : "filter-chip"}
            aria-pressed={item === filter}
            onClick={() => chooseFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="peers-layout">
        <div className="bookshelf" ref={shelfRef}>
          {show3D ? (
            <div className="shelf3d">
              <span className="shelf3d__badge">3D 书架</span>
              <Scene3DBoundary fallback={rail}>
                <Suspense
                  fallback={
                    <p className="shelf3d__loading" role="status">
                      正在搭书架…
                    </p>
                  }
                >
                  <PeersBookshelfCanvas
                    books={shelfBooks}
                    activeId={active?.id ?? null}
                    animate={!reduced}
                    onOpen={chooseStory}
                  />
                </Suspense>
              </Scene3DBoundary>
            </div>
          ) : (
            rail
          )}
          {show3D && <p className="shelf3d__hint">点一本书，故事在下面打开 · 拖动可以转一点角度</p>}

          <div className="shelf3d__bar">
            {show3D && (
              <label className="shelf3d__pick">
                <span>按书名选</span>
                <select
                  value={selectedId ?? ""}
                  onChange={(event) => {
                    const id = event.target.value;
                    if (!id) {
                      closeBook();
                    } else if (id !== selectedId) {
                      chooseStory(id);
                    }
                  }}
                >
                  <option value="">挑一本书…</option>
                  {filtered.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {webgl && (
              <button type="button" className="text-button" aria-pressed={powerSaving} onClick={togglePowerSaving}>
                {powerSaving ? "打开 3D 书架" : "改用图片书架（省电）"}
              </button>
            )}
          </div>
          {!webgl && <p className="shelf3d__note">这台设备暂时打不开 3D，用图片书架代替。点一本书，故事在下面打开。</p>}
        </div>

        {active && (
          <article className="peer-reader" aria-labelledby="peer-reader-title" ref={readerRef}>
            <button type="button" className="book-close" onClick={closeBook}>
              <span aria-hidden="true">← </span>合上这本书
            </button>
            <h2 id="peer-reader-title">{active.title}</h2>
            <p className="peer-deid">{active.deidentifiedNote}</p>

            <section className="peer-section">
              <h3>当时最怕什么</h3>
              <ul>
                {active.feared.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section className="peer-section">
              <h3>最想听到什么</h3>
              <ul>
                {active.wanted.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section className="peer-section">
              <h3>后来怎么走过</h3>
              <ul>
                {active.walked.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <p className="peer-message">给同路人的一句话：{active.message}</p>

            <section className="peer-section">
              <h3>报道里提到的支持</h3>
              <ul>
                {active.support.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <div className="peer-related">
              <h3>想多了解一点</h3>
              <div className="button-row">
                {chapters
                  .filter((chapter) => active.relatedChapterIds.includes(chapter.id))
                  .map((chapter) => (
                    <Link key={chapter.id} to={`/story/${chapter.id}`} className="text-button">
                      第 {chapter.number} 章 · {chapter.title}
                    </Link>
                  ))}
              </div>
            </div>

            <div className="button-row">
              <button type="button" className="primary-button" onClick={readStory}>
                读给我听
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  stopSpeaking();
                }}
              >
                停下来
              </button>
            </div>

            <p className="peer-source">
              来源：{active.sourcePublisher}《{active.sourceTitle}》 ·{" "}
              <a href={active.sourceUrl} target="_blank" rel="noreferrer">
                打开原文
              </a>
              <br />
              发布日期 {active.publishedAt} · 本站核对 {active.verifiedAt}
            </p>
          </article>
        )}
      </div>

      <p className="page-note">
        每篇故事都来自公开报道，未成年人姓名、具体地点和精确日期已做去标识化处理。
      </p>
    </div>
  );
}
