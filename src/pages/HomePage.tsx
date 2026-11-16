import { Link } from "react-router-dom";
import { useAssistant } from "@/src/features/assistant/AssistantContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import { usePageTitle } from "@/src/lib/usePageTitle";
import { knowledgeCards } from "@/src/data/knowledge/cards";
import { glossaryEntries } from "@/src/data/knowledge/glossary";
import { knowledgeGraphNodeIds } from "@/src/data/knowledge/graph";
import { policyResources } from "@/src/data/policies/resources";
import { stories } from "@/src/data/stories";
import { StoryCard } from "@/src/components/StoryCard";

const entries = [
  {
    to: "/learn",
    index: "01",
    title: "认识白血病",
    desc: "先用知识图谱看清概念关系，再按处境读七张主题卡，需要查词时进术语表。",
    go: "去科普页",
  },
  {
    to: "/resources",
    index: "02",
    title: "查医保和救助",
    desc: "按全国制度、浙江和景宁筛选，先确认参保地，再查办理入口和原文。",
    go: "去资料库",
  },
  {
    to: "/receipts",
    index: "03",
    title: "整理票据",
    desc: "把发票、费用清单和结算单归到同一次就诊，看清每一笔支出。",
    go: "看整理方式",
  },
  {
    to: "/stories",
    index: "04",
    title: "看看同路人",
    desc: "来自公开报道的七个家庭，记录他们怎么面对异地求医、费用、复学和照护安排。",
    go: "读故事",
  },
];

export default function HomePage() {
  usePageTitle("首页");
  const { isDemo, demoStatus, enterDemo, reloadDemo, exitDemo } = useWorkspace();
  const { open: openAssistant } = useAssistant();

  return (
    <>
      <section className="hero hero--home">
        <div className="hero__copy">
          <p className="eyebrow">儿童白血病就医资料夹</p>
          <h1 className="page-title">把看不懂的，变成能问、能查、能带走的一页</h1>
          <p className="lead">
            服务已确诊儿童白血病的家庭：用知识图谱看懂术语，按参保地查清医保和救助，再把每一次就诊的票据与申请材料整理在一起。
          </p>

          <div className="hero__stats" aria-label="站内内容概况">
            <span>
              <b>{knowledgeGraphNodeIds.length}</b> 个核心概念
            </span>
            <span>
              <b>{glossaryEntries.length}</b> 条术语
            </span>
            <span>
              <b>{policyResources.length}</b> 条公开资料
            </span>
            <span>
              <b>{knowledgeCards.length}</b> 张主题卡
            </span>
          </div>

          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={openAssistant}>
              问 AI 小助手
            </button>
            <Link className="btn btn--ghost" to="/learn">
              先看知识图谱
            </Link>
          </div>
        </div>

        <aside className="hero-file hero-file--workspace" aria-label="当前工作区">
          <div className="hero-file__top">
            <span>当前工作区</span>
            <span className="hero-file__badge">本机会话</span>
          </div>
          <div className="hero-file__state">
            <b>{isDemo ? "演示工作区" : "真实工作区"}</b>
            <p>
              {isDemo
                ? "正在查看景宁家庭的虚构票据与账目，修改不会影响真实资料。"
                : "票据、账目和材料只保存在当前浏览器会话；离开前可导出 CSV 或账本备份。"}
            </p>
          </div>
          <div className="hero-file__actions">
            <Link
              className="btn btn--primary btn--small"
              to="/receipts"
              onClick={isDemo ? reloadDemo : enterDemo}
            >
              {demoStatus === "loading"
                ? "正在载入示例…"
                : isDemo
                  ? "重新载入示例"
                  : "载入示例并看票据"}
            </Link>
            {isDemo ? (
              <button type="button" className="btn btn--ghost btn--small" onClick={exitDemo}>
                退出演示
              </button>
            ) : null}
          </div>
          <p className="hero-file__foot">
            文件只在本机浏览器处理
            <span aria-hidden="true"> · </span>
            公开政策以来源原文为准
          </p>
        </aside>
      </section>

      <section className="section" aria-labelledby="entries-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="entries-title">
              从哪里开始
            </h2>
            <p className="section__note">不确定看哪一块？先选最接近你现在处境的一项。</p>
          </div>
        </div>
        <div className="grid-entries">
          {entries.map((entry) => (
            <Link key={entry.title} to={entry.to} className="entry-card">
              <span className="entry-card__index">{entry.index}</span>
              <span className="entry-card__title">{entry.title}</span>
              <span className="entry-card__desc">{entry.desc}</span>
              <span className="entry-card__go">{entry.go} →</span>
            </Link>
          ))}
        </div>
        <p className="home-demo-note">
          想先看效果？首页上方的工作区可以载入景宁家庭的虚构示例；演示与真实资料分开保存，可随时退出。
        </p>
      </section>

      <section className="section" aria-labelledby="story-preview-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="story-preview-title">
              公开报道里的同路人
            </h2>
            <p className="section__note">七个来自公开报道的家庭，已做去标识化处理；读方法，不读“标准答案”。</p>
          </div>
          <Link className="section__link" to="/stories">
            全部故事 →
          </Link>
        </div>
        <div className="story-grid">
          {stories.slice(0, 2).map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="example-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="example-title">
              一个景宁家庭会怎么用
            </h2>
            <p className="section__note">示例情境，费用与票据均为虚构数据。</p>
          </div>
        </div>
        <ol className="flow">
          <li>
            <b>先学会怎么问</b>
            <span>在知识图谱里点开「骨髓穿刺」，再复制「骨髓检查、免疫分型、基因检测有什么区别」去问医生。</span>
          </li>
          <li>
            <b>再查入口</b>
            <span>确认参保地是景宁，查看浙江门诊特殊病种和第五期「小鹿灯」的原文与办理入口。</span>
          </li>
          <li>
            <b>最后整理票据</b>
            <span>把住院发票和同次医保结算单归成一次就诊，再到提交准备页逐份保存原件。</span>
          </li>
        </ol>
      </section>
    </>
  );
}
