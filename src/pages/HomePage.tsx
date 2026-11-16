import { Link } from "react-router-dom";
import { useAssistant } from "@/src/features/assistant/AssistantContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import { localStoreNote, useLocalStoreStatus } from "@/src/lib/localStore";
import { usePageTitle } from "@/src/lib/usePageTitle";
import { knowledgeCards } from "@/src/data/knowledge/cards";
import { glossaryEntries } from "@/src/data/knowledge/glossary";
import { knowledgeGraphNodeIds } from "@/src/data/knowledge/graph";
import { policyResources } from "@/src/data/policies/resources";
import { stories } from "@/src/data/stories";
import { StoryCard } from "@/src/components/StoryCard";

const steps = [
  {
    to: "/learn",
    index: "01",
    title: "看懂病",
    desc: "用知识图谱看清分型、检查和治疗阶段，复制要问医生的问题。",
    go: "去科普页",
  },
  {
    to: "/stories",
    index: "02",
    title: "看看同路人",
    desc: "公开报道里的家庭怎么面对异地求医、费用、复学和照护。",
    go: "读故事",
  },
  {
    to: "/route",
    index: "03",
    title: "排好我家的路线",
    desc: "选参保地和就医地，按顺序列出医保结算、救助和公益项目要办的事。",
    go: "排路线",
  },
  {
    to: "/receipts",
    index: "04",
    title: "算清账",
    desc: "导入发票、费用清单和结算单，归成一次次就诊，每个数字都能回到原件。",
    go: "导入票据",
  },
  {
    to: "/prepare",
    index: "05",
    title: "去申请",
    desc: "按救助项目逐项准备材料；需要公开求助时，从账本生成可核对的说明草稿。",
    go: "准备材料",
  },
];

const moreLinks = [
  { to: "/resources", label: "医保和救助资料库" },
  { to: "/ledger", label: "家庭费用账本" },
  { to: "/fundraising", label: "筹款准备" },
  { to: "/about", label: "资料来源与隐私说明" },
];

export default function HomePage() {
  usePageTitle("首页");
  const { isDemo, demoStatus, enterDemo, reloadDemo, exitDemo } = useWorkspace();
  const { open: openAssistant } = useAssistant();
  const storageStatus = useLocalStoreStatus();

  return (
    <>
      <section className="hero hero--home">
        <div className="hero__copy">
          <p className="eyebrow">儿童白血病就医资料夹</p>
          <h1 className="page-title">把看不懂的，变成能问、能查、能带走的一页</h1>
          <p className="lead">
            服务全国已确诊儿童白血病的家庭：看懂病，看看同路人怎么走，按参保地排好要办的事，把票据算清楚，再带着能核对的材料去申请。
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
            <span className="hero-file__badge">{isDemo ? "演示不保存" : storageStatus === "ok" ? "已存本机" : "本机会话"}</span>
          </div>
          <div className="hero-file__state">
            <b>{isDemo ? "演示工作区" : "真实工作区"}</b>
            <p>
              {isDemo
                ? "正在查看示例家庭（参保地设为浙江景宁）的虚构票据与账目，修改不会影响真实资料。"
                : `票据、账目和材料只在这台设备上。${localStoreNote(storageStatus, false)}`}
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
              一条线走下来
            </h2>
            <p className="section__note">五步按顺序排好，也可以直接从你现在卡住的那一步开始。</p>
          </div>
        </div>
        <ol className="grid-entries grid-entries--steps">
          {steps.map((step) => (
            <li key={step.title}>
              <Link to={step.to} className="entry-card">
                <span className="entry-card__index">第 {step.index} 步</span>
                <span className="entry-card__title">{step.title}</span>
                <span className="entry-card__desc">{step.desc}</span>
                <span className="entry-card__go">{step.go} →</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="home-more-links">
          其他入口：
          {moreLinks.map((item, index) => (
            <span key={item.to}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <Link to={item.to}>{item.label}</Link>
            </span>
          ))}
        </p>
        <p className="home-demo-note">
          想先看效果？首页上方的工作区可以载入一个虚构示例家庭；演示与真实资料分开保存，可随时退出。
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
              示例：一个虚构家庭怎么走完这条线
            </h2>
            <p className="section__note">
              演示把参保地设为浙江景宁，只是为了带出一个真实存在的地方救助项目；费用与票据均为虚构数据。换成你家的参保地，路线和资料会跟着变。
            </p>
          </div>
        </div>
        <ol className="flow flow--five">
          <li>
            <b>看懂病</b>
            <span>在知识图谱里点开「骨髓穿刺」，复制「骨髓检查、免疫分型、基因检测有什么区别」去问医生。</span>
          </li>
          <li>
            <b>看同路人</b>
            <span>读一篇异地求医家庭的报道，记下他们先办了哪些手续、保留了哪些票据。</span>
          </li>
          <li>
            <b>排路线</b>
            <span>选参保地，列出全国医保制度、浙江门诊特殊病种和当地「小鹿灯」各要办什么。</span>
          </li>
          <li>
            <b>算清账</b>
            <span>把住院发票和同次医保结算单归成一次就诊，外购药和基因检测各记一笔，读出每类已支付金额。</span>
          </li>
          <li>
            <b>去申请</b>
            <span>到提交准备页对照费用时间段，逐份关联原件，再按官方入口要求自行提交。</span>
          </li>
        </ol>
      </section>
    </>
  );
}
