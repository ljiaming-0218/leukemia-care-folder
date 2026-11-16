import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/src/components/PageHeader";
import { StoryCard } from "@/src/components/StoryCard";
import { StoryFeature } from "@/src/components/StoryFeature";
import { stories, storyThemes, type StoryTheme } from "@/src/data/stories";
import { scrollToElement } from "@/src/lib/scrollToElement";
import { usePageTitle } from "@/src/lib/usePageTitle";

const movedFundraisingAnchors = new Set([
  "crowdfunding-assistant",
  "fundraising",
  "fundraising-checklist",
  "request-outline",
  "fundraising-official",
]);

export default function StoriesPage() {
  usePageTitle("同路人故事");

  const location = useLocation();
  const navigate = useNavigate();
  const readerRef = useRef<HTMLElement>(null);
  const suppressScrollRef = useRef(false);
  const [theme, setTheme] = useState<StoryTheme | "全部">("全部");
  const [activeId, setActiveId] = useState(stories[0].id);

  const sourceCount = new Set(
    stories.map((story) => story.source.name.split("（")[0].trim()),
  ).size;
  const latestVerifiedAt = stories
    .map((story) => story.source.verifiedAt)
    .sort()
    .at(-1);

  const filteredStories = useMemo(
    () => (theme === "全部" ? stories : stories.filter((story) => story.themes.includes(theme))),
    [theme],
  );

  const activeStory =
    stories.find((story) => story.id === activeId) ?? filteredStories[0] ?? stories[0];
  const activeOrder = stories.findIndex((story) => story.id === activeStory.id) + 1;
  const positionInList = filteredStories.findIndex((story) => story.id === activeStory.id);
  const prevStory = positionInList > 0 ? filteredStories[positionInList - 1] : null;
  const nextStory =
    positionInList >= 0 && positionInList < filteredStories.length - 1
      ? filteredStories[positionInList + 1]
      : null;

  useEffect(() => {
    const target = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!target) return;

    if (movedFundraisingAnchors.has(target)) {
      navigate(`/fundraising#${target === "fundraising" ? "crowdfunding-assistant" : target}`, {
        replace: true,
      });
      return;
    }

    const story = stories.find((item) => item.id === target);
    if (!story) return;

    setActiveId(story.id);
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }

    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        if (readerRef.current) scrollToElement(readerRef.current);
      });
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [location.hash, navigate]);

  function selectStory(id: string) {
    if (id === activeStory.id) {
      if (readerRef.current) scrollToElement(readerRef.current);
      return;
    }
    navigate(`/stories#${id}`, { replace: true });
  }

  function selectTheme(next: StoryTheme | "全部") {
    setTheme(next);
    const list =
      next === "全部" ? stories : stories.filter((story) => story.themes.includes(next));
    if (list.length > 0 && !list.some((story) => story.id === activeStory.id)) {
      suppressScrollRef.current = true;
      navigate(`/stories#${list[0].id}`, { replace: true });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="公开报道里的同路人"
        title="治疗之外，日子还要继续"
        lead={`${stories.length} 个来自公开报道的家庭，记录异地求医、费用压力、复学与照护安排里的具体问题。只摘录报道里能核对的事实，不补充情节。`}
      />

      <p className="story-disclaimer">
        <span>
          <b>关于这些故事。</b>
          内容摘自已公开报道，已对未成年人姓名、具体地点和精确日期做去标识化处理；来源链接保留，可回原文核对。
        </span>
        <span className="story-disclaimer__meta">
          {stories.length} 个公开报道家庭 · {sourceCount} 家媒体来源 ·{" "}
          <span className="story-disclaimer__nowrap">最近核对 {latestVerifiedAt}</span>
        </span>
      </p>

      <section className="section story-section" aria-labelledby="stories-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="stories-title">
              故事墙
            </h2>
            <p className="section__note">
              共 {filteredStories.length} 篇。按主题筛选后，下方的长文会同步切换；点开一张卡，就在下方读全文。
            </p>
          </div>
          <button type="button" className="story-jump" onClick={() => selectStory(activeStory.id)}>
            跳到正在读
            <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div className="story-filter" role="group" aria-label="按主题筛选故事">
          <button
            type="button"
            aria-pressed={theme === "全部"}
            onClick={() => selectTheme("全部")}
          >
            全部
            <span>{stories.length}</span>
          </button>
          {storyThemes.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={theme === item}
              onClick={() => selectTheme(item)}
            >
              {item}
              <span>{stories.filter((story) => story.themes.includes(item)).length}</span>
            </button>
          ))}
        </div>

        <div className="story-wall">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              order={stories.findIndex((item) => item.id === story.id) + 1}
              active={story.id === activeStory.id}
            />
          ))}
        </div>
      </section>

      <section className="section story-reader" ref={readerRef} aria-labelledby="reader-title">
        <h2 className="visually-hidden" id="reader-title">
          正在读的故事
        </h2>

        <div className="story-readingbar">
          <p className="story-readingbar__count" aria-live="polite">
            正在读 <b>{String(activeOrder).padStart(2, "0")}</b>
            <span className="story-readingbar__total">/ {String(stories.length).padStart(2, "0")}</span>
            <span className="story-readingbar__themes">{activeStory.themes.join(" · ")}</span>
          </p>
          <div className="story-readingbar__pager">
            <button
              type="button"
              disabled={!prevStory}
              onClick={() => prevStory && selectStory(prevStory.id)}
            >
              ← 上一篇
            </button>
            <button
              type="button"
              disabled={!nextStory}
              onClick={() => nextStory && selectStory(nextStory.id)}
            >
              下一篇 →
            </button>
          </div>
        </div>

        <StoryFeature
          key={activeStory.id}
          story={activeStory}
          order={activeOrder}
          total={stories.length}
        />
      </section>

      <section className="story-reading" aria-labelledby="reading-title">
        <p className="story-reading__label">读故事时</p>
        <div>
          <h2 id="reading-title">别把自己家放进别人的时间表</h2>
          <p className="story-reading__note">报道能提供方法，但不能提供答案。</p>
          <ul className="plain-list">
            <li>报道里的分型、危险度和治疗阶段不一定和你家相同，恢复快慢不能直接比较。</li>
            <li>故事里的“撑过来”不是治疗承诺，也不能用来要求孩子必须乐观。</li>
            <li>报道里的费用估计、药价和救助金额对应当时的治疗阶段和地区，不能直接当成你家的账单。</li>
            <li>复学、陪读和情绪支持，可以和主治医生、医院社工、学校老师一起商量具体安排。</li>
            <li>如果情绪持续低落、影响吃饭和睡眠，可以向主治医生、医院社工或学校心理老师求助。</li>
          </ul>
        </div>
      </section>

      <section className="story-next" aria-labelledby="story-next-title">
        <p className="story-next__label">如果治疗费用需要求助</p>
        <div>
          <h2 id="story-next-title">先把官方救助和公开募捐分开</h2>
          <p>
            小鹿灯、医疗救助按公告向项目方申请；公开募捐需由具备资格的慈善组织发起。本站只提供本地草稿和核对清单。
          </p>
          <Link to="/fundraising" className="story-next__link">
            去筹款准备
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
