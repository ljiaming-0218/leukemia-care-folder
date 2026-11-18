import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { Scene3DBoundary } from "@/src/components/three/Scene3DBoundary";
import { detectWebGL } from "@/src/components/three/webgl";
import type { WordSkyCard, WordSkyFocus } from "@/src/components/three/WordsConstellationCanvas";
import { chapters, getChapter } from "@/src/data/story/chapters";
import { getSource } from "@/src/data/story/sources";
import { words } from "@/src/data/story/words";
import { useMotion } from "@/src/lib/motion";
import { usePageTitle } from "@/src/lib/usePageTitle";

const WordsConstellationCanvas = lazy(() => import("@/src/components/three/WordsConstellationCanvas"));

const POWER_KEY = "marrow-factory:words-power";
const PAGE_SIZE = 8;

const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
const DETAIL_BUDDIES = ["red", "stem", "white", "white", "platelet", "white", "red", "stem"] as const;

function readPowerSaving() {
  try {
    return localStorage.getItem(POWER_KEY) === "on";
  } catch {
    return false;
  }
}

export default function WordsPage() {
  usePageTitle("词语卡");
  const [query, setQuery] = useState("");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [powerSaving, setPowerSaving] = useState(readPowerSaving);
  const [scrollTick, setScrollTick] = useState(0);
  const { hash } = useLocation();
  const [page, setPage] = useState(0);
  const [announce, setAnnounce] = useState("");
  const motion = useMotion();
  const reduced = motion === "reduce";
  const webgl = useMemo(() => detectWebGL(), []);
  const show3D = webgl && !powerSaving;
  const detailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPage(0);
  }, [chapterFilter, query]);

  useEffect(() => {
    if (scrollTick === 0) return;
    detailRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [reduced, scrollTick]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((word) =>
      [word.term, ...word.aka, word.kid, word.grownUp].some((text) => text.toLowerCase().includes(q)),
    );
  }, [query]);

  const filtered = useMemo(
    () => (chapterFilter === "all" ? searched : searched.filter((word) => word.chapterId === chapterFilter)),
    [chapterFilter, searched],
  );

  const chapterCounts = useMemo(() => {
    const counts = new Map<string, number>(chapters.map((chapter) => [chapter.id, 0]));
    for (const word of searched) {
      counts.set(word.chapterId, (counts.get(word.chapterId) ?? 0) + 1);
    }
    return counts;
  }, [searched]);

  const activeChapter = chapterFilter === "all" ? null : chapterById.get(chapterFilter) ?? null;
  const mode = query.trim() || chapterFilter !== "all" ? "words" : "chapters";
  const selectedWord = filtered.find((word) => word.id === selectedId) ?? null;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const visibleWords = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart],
  );
  const paged = mode === "words" && filtered.length > PAGE_SIZE;

  const skyCards = useMemo<WordSkyCard[]>(() => {
    if (mode === "chapters") {
      return chapters.map((chapter) => ({
        id: chapter.id,
        kind: "chapter",
        eyebrow: `第 ${chapter.number} 章`,
        title: chapter.title,
        meta: `${chapterCounts.get(chapter.id) ?? 0} 个词`,
        hue: chapter.hue,
      }));
    }
    return visibleWords.flatMap((word) => {
      const chapter = chapterById.get(word.chapterId);
      if (!chapter) return [];
      return [
        {
          id: word.id,
          kind: "word" as const,
          eyebrow: `第 ${chapter.number} 章`,
          title: word.term,
          meta: "",
          hue: chapter.hue,
        },
      ];
    });
  }, [chapterCounts, mode, visibleWords]);

  const focus = useMemo<WordSkyFocus>(() => {
    if (mode === "chapters") {
      return {
        eyebrow: "词语星图",
        title: `${words.length} 个词`,
        meta: `${chapters.length} 章 · 点章节进入`,
        hue: "sun",
      };
    }
    if (activeChapter) {
      return {
        eyebrow: `第 ${activeChapter.number} 章`,
        title: activeChapter.title,
        meta: paged ? `${filtered.length} 个词 · 第 ${currentPage + 1}/${pageCount} 组` : `${filtered.length} 个词`,
        hue: activeChapter.hue,
      };
    }
    return {
      eyebrow: "搜索结果",
      title: query.trim() ? `“${query.trim().slice(0, 12)}”` : "全部词语",
      meta: paged ? `${filtered.length} 个词 · 第 ${currentPage + 1}/${pageCount} 组` : `${filtered.length} 个词`,
      hue: "sky",
    };
  }, [activeChapter, currentPage, filtered.length, mode, pageCount, paged, query]);

  function chooseWord(id: string, withAnnouncement = true) {
    const next = words.find((word) => word.id === id);
    const index = filtered.findIndex((word) => word.id === id);
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE));
    setSelectedId(id);
    if (next && withAnnouncement) setAnnounce(`已选中「${next.term}」`);
    setScrollTick((tick) => tick + 1);
  }

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    const word = words.find((item) => item.id === id);
    if (!word) return;
    setQuery("");
    setChapterFilter("all");
    setSelectedId(id);
    setScrollTick((tick) => tick + 1);
  }, [hash]);

  function togglePowerSaving() {
    const next = !powerSaving;
    setPowerSaving(next);
    try {
      localStorage.setItem(POWER_KEY, next ? "on" : "off");
    } catch {
      // The preference simply stays in memory when storage is unavailable.
    }
  }

  function goPage(next: number) {
    const target = Math.max(0, Math.min(pageCount - 1, next));
    setPage(target);
    const from = target * PAGE_SIZE + 1;
    const to = Math.min(filtered.length, (target + 1) * PAGE_SIZE);
    setAnnounce(`星图翻到第 ${target + 1} 组，第 ${from} 到 ${to} 个词`);
  }

  function chooseChapter(id: string) {
    const chapter = chapterById.get(id);
    setChapterFilter(id);
    if (chapter) setAnnounce(`已打开第 ${chapter.number} 章「${chapter.title}」的词语`);
  }

  function toggle(id: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isFlipped = selectedWord ? flipped.has(selectedWord.id) : false;
  const selectedChapter = selectedWord ? chapterById.get(selectedWord.chapterId) ?? null : null;
  const selectedSource = selectedWord ? getSource(selectedWord.sourceId) : null;
  const detailBuddy = selectedChapter
    ? DETAIL_BUDDIES[(selectedChapter.number - 1) % DETAIL_BUDDIES.length]
    : "stem";

  return (
    <div className="page page--words">
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>

      <header className="chapter-head">
        <span className="chapter-head__icon" aria-hidden="true">
          <CellBuddy kind="stem" size={64} title="" />
        </span>
        <div>
          <p className="chapter-head__num">词语卡</p>
          <h1 className="chapter-head__title">医院里的新词</h1>
        </div>
      </header>
      <div className="word-intro">
        <span className="word-intro__buddy" aria-hidden="true">
          <CellBuddy kind="red" size={52} title="" />
        </span>
        <p className="page-lead">
          在医院里会听到很多新词。先按章节找到它们，再点开词卡：正面是讲给小朋友的话，翻过来是给大人的解释和出处。
        </p>
      </div>

      <section className="word-toolbar" aria-label="词语导航">
        <div className="word-toolbar__top">
          <label className="search-field">
            <span>找一个词</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (chapterFilter !== "all") setChapterFilter("all");
              }}
              placeholder="例如：骨穿、化疗"
            />
          </label>
          {query.trim() && (
            <button type="button" className="text-button word-toolbar__clear" onClick={() => setQuery("")}>
              清空搜索
            </button>
          )}
          <p className="result-count" role="status">
            {query.trim() || chapterFilter !== "all" ? `找到 ${filtered.length} 个词` : `一共 ${words.length} 个词`}
          </p>
        </div>
        <div className="word-toolbar__chips" role="group" aria-label="按章节找词">
          <button
            type="button"
            className={`filter-chip${chapterFilter === "all" ? " is-active" : ""}`}
            aria-pressed={chapterFilter === "all"}
            onClick={() => setChapterFilter("all")}
          >
            全部章节
            <span className="word-chip__count">{searched.length}</span>
          </button>
          {chapters.map((chapter) => {
            const active = chapterFilter === chapter.id;
            return (
              <button
                key={chapter.id}
                type="button"
                className={`filter-chip${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={() => chooseChapter(chapter.id)}
              >
                <span className="word-chip__num">{chapter.number}</span>
                {chapter.title}
                <span className="word-chip__count">{chapterCounts.get(chapter.id) ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="word-sky" aria-labelledby="word-sky-title">
        <div className="word-sky__head">
          <div>
            <h2 id="word-sky-title">{show3D ? "词语星图" : "词语索引"}</h2>
            <p>
              {mode === "chapters"
                ? show3D
                  ? "每个章节是一张卡片，点进去看看这一章的词是怎么连在一起的。"
                  : "先按章节找词，下面的索引列出全部词语，点一个就能看解释。"
                : show3D
                  ? "每一根线都从章节连到词卡。拖动旋转，点一张词卡看解释。"
                  : "下面是这一组词语，点一个就能看解释。"}
            </p>
          </div>
          {show3D && <span className="word-sky__badge">3D</span>}
        </div>

        {filtered.length === 0 ? (
          <p className="word-sky__empty">没找到这个词。可以换个说法，或者问问医生和护士。</p>
        ) : show3D ? (
          <div className="word-sky__stage">
            <Scene3DBoundary
              fallback={<p className="word-sky__loading">3D 星图暂时打不开，下面的文字索引一样可以查词。</p>}
            >
              <Suspense fallback={<p className="word-sky__loading">正在铺词卡…</p>}>
                <WordsConstellationCanvas
                  cards={skyCards}
                  focus={focus}
                  activeId={mode === "words" ? selectedWord?.id ?? null : null}
                  animate={!reduced}
                  onSelectWord={chooseWord}
                  onSelectChapter={chooseChapter}
                />
              </Suspense>
            </Scene3DBoundary>
          </div>
        ) : (
          <p className="word-sky__fallback">
            {powerSaving
              ? "省电模式已打开。下面的文字索引列出全部词语，点一个就能翻看词卡；想回到星图，点下面的「打开 3D 星图」。"
              : "这台设备暂时打不开 3D 星图，下面的文字索引一样可以按章节找词、翻看词卡。"}
          </p>
        )}

        {paged && show3D && (
          <div className="word-sky__pager" role="group" aria-label="词语星图翻页">
            <button
              type="button"
              className="text-button"
              disabled={currentPage === 0}
              onClick={() => goPage(currentPage - 1)}
            >
              上一组
            </button>
            <span className="word-sky__page-label">
              第 {pageStart + 1}–{Math.min(filtered.length, pageStart + PAGE_SIZE)} 个 · 共 {filtered.length} 个
            </span>
            <button
              type="button"
              className="text-button"
              disabled={currentPage >= pageCount - 1}
              onClick={() => goPage(currentPage + 1)}
            >
              下一组
            </button>
          </div>
        )}

        <div className="word-sky__bar">
          <p className="word-sky__hint">
            {show3D ? "拖动旋转 · 双指或滚轮缩放 · 点词卡" : "文字索引列出全部词语，点一个词就能看解释。"}
          </p>
          {paged && show3D && (
            <p className="word-sky__hint">星图每组 8 个词，下面文字索引有全部结果。</p>
          )}
          {webgl && (
            <button
              type="button"
              className="text-button"
              aria-pressed={powerSaving}
              onClick={togglePowerSaving}
            >
              {powerSaving ? "打开 3D 星图" : "改用文字索引（省电）"}
            </button>
          )}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
      </section>

      <section className="word-detail" ref={detailRef} aria-labelledby={selectedWord ? "word-detail-title" : "word-detail-empty"}>
        {selectedWord ? (
          <article className={`word-card word-card--detail ${isFlipped ? "is-flipped" : ""}`}>
            <div className="word-detail__head">
              <div className="word-detail__heading">
                <span
                  className={`word-detail__buddy hue-${selectedChapter?.hue ?? "sky"}`}
                  aria-hidden="true"
                >
                  <CellBuddy kind={detailBuddy} size={40} title="" />
                </span>
                <div>
                  <p className="word-detail__kicker">
                    {selectedChapter ? `第 ${selectedChapter.number} 章 · ${selectedChapter.title}` : "词语卡"}
                  </p>
                  <h2 id="word-detail-title" className="word-card__term">
                    {selectedWord.term}
                    {selectedWord.aka.length > 0 && (
                      <span className="word-card__aka">也叫 {selectedWord.aka.join("、")}</span>
                    )}
                  </h2>
                </div>
              </div>
              <button type="button" className="text-button" onClick={() => setSelectedId(null)}>
                收起
              </button>
            </div>

            {isFlipped ? (
              <>
                <p className="word-card__tag">给大人</p>
                <p>{selectedWord.grownUp}</p>
                {selectedSource && (
                  <p className="word-card__source">
                    出处：
                    <a href={selectedSource.url} target="_blank" rel="noreferrer">
                      {selectedSource.title}
                    </a>
                    （{selectedSource.publisher}，本站核对 {selectedSource.verifiedAt}）
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="word-card__tag">给小朋友</p>
                <p className="word-card__kid">{selectedWord.kid}</p>
              </>
            )}

            <div className="word-card__actions">
              <button type="button" className="text-button" aria-pressed={isFlipped} onClick={() => toggle(selectedWord.id)}>
                {isFlipped ? "翻回小朋友这面" : "翻过来给大人看"}
              </button>
              {selectedChapter && (
                <Link to={`/story/${selectedChapter.id}`} className="text-link">
                  在第 {selectedChapter.number} 章出现
                </Link>
              )}
            </div>
          </article>
        ) : (
          <>
            <h2 id="word-detail-empty" className="word-detail__title">
              想看哪个词？
            </h2>
            <div className="word-detail__empty">
              <span className="word-detail__empty-buddy" aria-hidden="true">
                <CellBuddy kind="white" size={46} title="" />
              </span>
              <p>点一张词卡，这里会显示小朋友版解释；翻过来还能看到给大人的说明和出处。</p>
            </div>
          </>
        )}
      </section>

      <details key={show3D ? "3d" : "text"} className="word-index" open={show3D ? undefined : true}>
        <summary>
          文字索引<span className="word-index__count">{filtered.length}</span>
        </summary>
        {filtered.length > 0 ? (
          <ul className="word-index__list">
            {filtered.map((word) => {
              const chapter = chapterById.get(word.chapterId);
              const active = selectedWord?.id === word.id;
              return (
                <li key={word.id}>
                  <button
                    type="button"
                    className={`word-index__item${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => chooseWord(word.id)}
                  >
                    <span className="word-index__term">
                      <span className={`word-index__dot hue-${chapter?.hue ?? "sky"}`} aria-hidden="true" />
                      {word.term}
                    </span>
                    <span className="word-index__meta">
                      {chapter ? `第 ${chapter.number} 章` : "词语卡"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="word-index__empty">没有符合条件的词。</p>
        )}
      </details>
    </div>
  );
}
