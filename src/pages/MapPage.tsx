import { Link } from "react-router-dom";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { chapterIcon } from "@/src/components/story/chapterIcon";
import { EmergencyNote } from "@/src/components/story/EmergencyNote";
import { chapters } from "@/src/data/story/chapters";
import { useStickers } from "@/src/lib/stickers";
import { usePageTitle } from "@/src/lib/usePageTitle";

export default function MapPage() {
  usePageTitle("故事地图");
  const stickers = useStickers();
  const got = chapters.filter((chapter) => stickers.includes(chapter.id)).length;
  const next = chapters.find((chapter) => !stickers.includes(chapter.id)) ?? chapters[0];

  return (
    <div className="page page--map">
      <section className="hero">
        <div className="hero__cells" aria-hidden="true">
          <CellBuddy kind="red" size={64} className="float float--a" title="" />
          <CellBuddy kind="white" size={58} className="float float--b" title="" />
          <CellBuddy kind="platelet" size={44} className="float float--c" title="" />
        </div>
        <p className="hero__eyebrow">讲给孩子听的白血病</p>
        <h1 className="hero__title">
          <span className="nowrap">欢迎来到</span>
          <span className="nowrap">骨髓小工厂</span>
        </h1>
        <p className="hero__lead">
          这里有 8 个小故事，讲你身体里的血细胞、生病是怎么回事、医生怎么检查和治疗、怎么保护自己，还有回到学校和按时复查。最好请爸爸妈妈陪你一起读。
        </p>
        <p className="hero__meta">
          <span>家长陪读</span>
          <span>每次 3–10 分钟</span>
          <span>8 个故事 · 6 个 3D 场景</span>
        </p>
        <div className="button-row">
          <Link to={`/story/${next.id}`} className="primary-button">
            {got === 0 ? "从第 1 章开始" : got === chapters.length ? "再读一遍第 1 章" : `接着读第 ${next.number} 章`}
          </Link>
          <Link to="/explore" className="primary-button explore-button">
            3D 身体探险
          </Link>
          <Link to="/grown-ups" className="text-button">
            大人先看这里
          </Link>
        </div>
      </section>

      <section aria-labelledby="map-title" className="map">
        <div className="map__head">
          <h2 id="map-title">故事地图</h2>
          <p className="sticker-count" role="status">
            已收集贴纸 {got} / {chapters.length}
          </p>
        </div>
        <ol className="map__path">
          {chapters.map((chapter) => {
            const done = stickers.includes(chapter.id);
            return (
              <li key={chapter.id} className={`map-stop hue-${chapter.hue} ${done ? "is-done" : ""}`}>
                <Link to={`/story/${chapter.id}`} className="map-stop__link">
                  <span className="map-stop__badge" aria-hidden="true">
                    <CellBuddy kind={chapterIcon(chapter.scene)} size={52} title="" />
                    <span className="map-stop__num">{chapter.number}</span>
                  </span>
                  <span className="map-stop__text">
                    <span className="map-stop__title">
                      第 {chapter.number} 章 · {chapter.title}
                    </span>
                    <span className="map-stop__teaser">{chapter.teaser}</span>
                    <span className="map-stop__state">{done ? "已得贴纸" : "还没读"}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="more-title" className="more-places">
        <h2 id="more-title">还有这些地方</h2>
        <div className="more-grid">
          <Link to="/stories" className="more-card">
            <CellBuddy kind="stem" size={44} title="" />
            <span>
              <strong>同路人</strong>
              <span>看看别人家怎么走过</span>
            </span>
          </Link>
          <Link to="/recovery" className="more-card">
            <CellBuddy kind="platelet" size={44} title="" />
            <span>
              <strong>康复建议</strong>
              <span>治疗之外，日子怎么过</span>
            </span>
          </Link>
          <Link to="/feelings" className="more-card">
            <CellBuddy kind="white" size={44} title="" />
            <span>
              <strong>心里话</strong>
              <span>害怕、生气、难过都可以说</span>
            </span>
          </Link>
          <Link to="/words" className="more-card">
            <CellBuddy kind="stem" size={44} title="" />
            <span>
              <strong>词语卡</strong>
              <span>医院里的新词，翻面看大人版</span>
            </span>
          </Link>
          <Link to="/game/patrol" className="more-card">
            <CellBuddy kind="white" size={44} title="" />
            <span>
              <strong>巡逻小路</strong>
              <span>帮白细胞练习拦病菌</span>
            </span>
          </Link>
          <Link to="/grown-ups" className="more-card">
            <CellBuddy kind="red" size={44} title="" />
            <span>
              <strong>大人看这里</strong>
              <span>陪读方法、来源和隐私</span>
            </span>
          </Link>
        </div>
      </section>

      <EmergencyNote />

      <p className="page-note">
        这里讲的是常见情况，用来帮助理解。每个小朋友的检查和治疗都不一样，一切听自己医生的。
      </p>
    </div>
  );
}
