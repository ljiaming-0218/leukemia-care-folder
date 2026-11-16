import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/src/components/PageHeader";
import { StoryCard } from "@/src/components/StoryCard";
import { CrowdfundingAssistant } from "@/src/components/CrowdfundingAssistant";
import { stories, storyThemes, type StoryTheme } from "@/src/data/stories";
import { usePageTitle } from "@/src/lib/usePageTitle";

const fundraisingSteps = [
  {
    title: "先分清“官方救助”和“公开募捐”",
    body: "小鹿灯、医疗救助等由项目方或政府部门受理，按公告提交材料即可。面向社会公众公开募捐，则要由具有公开募捐资格的慈善组织发起，个人不能自行开展公开募捐。",
  },
  {
    title: "核对发起主体和方案",
    body: "在“慈善中国”查询慈善组织是否具有公开募捐资格、募捐方案是否备案。不要仅凭一张海报、一个群聊二维码就转账。",
  },
  {
    title: "把医疗和费用事实核清",
    body: "准备诊断证明、费用清单、医保结算单等能支撑说法的材料。只写材料能证明的内容，不夸大病情，不承诺治疗效果。",
  },
  {
    title: "写清用途、期限和剩余款项",
    body: "目标金额对应具体项目，例如治疗自费、交通、住宿、陪护；写明起止时间、执行方和剩余款项如何处理，避免“越多越好”的模糊表述。",
  },
  {
    title: "通过官方平台发布并保留记录",
    body: "按慈善组织或平台要求提交材料，保存审批、发布和收款记录。个人收款码不能替代公开募捐方案。",
  },
  {
    title: "定期更新进展",
    body: "费用变化、治疗阶段和剩余款项可以定期说明。更新时仍然不要公开孩子的正脸、证件号、病历号或完整住址。",
  },
];

const requestOutline = [
  {
    label: "孩子情况",
    text: "年龄、诊断名称、治疗阶段、目前在哪类医院治疗。不写证件号、病历号、完整住址或正脸照片。",
  },
  {
    label: "费用情况",
    text: "已经发生的费用、医保支付、个人负担，以及目标金额对应的具体支出。数字要有票据或结算单支撑。",
  },
  {
    label: "资金用途",
    text: "治疗自费、外购药、基因检测、交通、住宿或陪护。分别写清，不用“其他”概括全部。",
  },
  {
    label: "发起主体",
    text: "慈善组织名称、公开募捐资格证书和募捐方案备案信息；由个人求助平台发起的，写清平台名称和审核状态。",
  },
  {
    label: "起止时间",
    text: "募捐开始和结束日期、执行方、剩余款项如何处理。避免无限期和“越多越好”的表述。",
  },
  {
    label: "更新与隐私",
    text: "约定多久更新一次费用和进展；不公开孩子的正脸、证件号、病历号、学校全称和完整住址。",
  },
];

export default function StoriesPage() {
  usePageTitle("同路人故事");

  const [theme, setTheme] = useState<StoryTheme | "全部">("全部");
  const [copyStatus, setCopyStatus] = useState("");

  const filteredStories = useMemo(
    () => (theme === "全部" ? stories : stories.filter((story) => story.themes.includes(theme))),
    [theme],
  );

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 4200);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  async function copyChecklist() {
    const text = [
      "公开筹款前核对清单（不代替民政部门或平台审核）",
      ...fundraisingSteps.map((step, index) => `${index + 1}. ${step.title}\n${step.body}`),
      "提醒：本站不收款，也不提供捐赠入口。遇到“包装费”“推广费”“保证筹到”的说法，先停下来向官方平台核验。",
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("已复制核对清单，可粘贴到备忘录。请以民政部门和官方平台当前要求为准。");
    } catch {
      setCopyStatus("浏览器没有允许复制，请手动选择下方清单文字。");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="公开报道里的同路人"
        title="治疗之外，日子还要继续"
        lead="三个来自公开报道的家庭，记录他们在异地求医、费用压力和照护安排里遇到的具体问题。故事只摘录报道里能核对的事实，不补充情节，也不构成治疗、预后或筹款建议。"
      />

      <div className="story-disclaimer" role="note">
        <b>关于这些故事</b>
        <p>
          以下内容摘自已公开发布的新闻报道，只保留与就医整理相关的信息。报道中的孩子姓名按原文使用；部分报道说明为化名。本站不展示正脸、证件号、病历号或完整住址，也不为任何家庭收款。
        </p>
      </div>

      <div className="story-summary" aria-label="故事页内容概况">
        <span>
          <b>{stories.length}</b> 个公开报道家庭
        </span>
        <span>
          <b>{new Set(stories.map((story) => story.source.name)).size}</b> 个报道来源
        </span>
        <span>
          <b>0</b> 个收款入口
        </span>
      </div>

      <section className="section section--tight" aria-labelledby="stories-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="stories-title">
              他们的这一段
            </h2>
            <p className="section__note">
              先看报道里能核对的时间线、费用线索和得到的支持，再看哪些站内工具可以借用。
            </p>
          </div>
          <p className="section__note">共 {stories.length} 个报道</p>
        </div>

        <div className="story-controls">
          <div className="chip-group" role="group" aria-label="按主题筛选故事">
            <button
              type="button"
              className="chip"
              aria-pressed={theme === "全部"}
              onClick={() => setTheme("全部")}
            >
              全部
              <span className="chip__count">{stories.length}</span>
            </button>
            {storyThemes.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={theme === item}
                onClick={() => setTheme(item)}
              >
                {item}
                <span className="chip__count">
                  {stories.filter((story) => story.themes.includes(item)).length}
                </span>
              </button>
            ))}
          </div>
          <p className="story-controls__count" aria-live="polite">
            显示 {filteredStories.length} 个故事
          </p>
        </div>

        {filteredStories.length === 0 ? (
          <div className="card">
            <p className="card__body">这个主题下暂时没有故事，切回「全部」可以看到三个家庭。</p>
          </div>
        ) : (
          <div className="story-list">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="reading-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="reading-title">
              读故事时，别把自己家放进别人的时间表
            </h2>
            <p className="section__note">报道能提供方法，但不能提供答案。</p>
          </div>
        </div>
        <div className="story-reading">
          <ul className="plain-list">
            <li>报道里的分型、危险度和治疗阶段不一定和你家相同，恢复快慢不能直接比较。</li>
            <li>故事里的“撑过来”不是治疗承诺，也不能用来要求孩子必须乐观。</li>
            <li>可以借用的是整理票据、列复诊问题、寻求陪护支持这些具体做法。</li>
            <li>如果情绪持续低落、影响吃饭和睡眠，可以向主治医生、医院社工或学校心理老师求助。</li>
          </ul>
        </div>
      </section>

      <CrowdfundingAssistant />

      <section className="section" id="fundraising" aria-labelledby="fundraising-title">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="fundraising-title">
              如果身边家庭需要发起筹款
            </h2>
            <p className="section__note">
              先把“向谁申请”和“向公众募捐”分开。下面是一份发布前的核对清单，不代替民政部门或平台的审核。
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--small" onClick={copyChecklist}>
            复制核对清单
          </button>
        </div>

        <p className="copy-feedback" role="status" aria-live="polite">
          {copyStatus}
        </p>

        <div className="fundraising-steps">
          {fundraisingSteps.map((step, index) => (
            <article className="fundraising-step" key={step.title}>
              <span className="fundraising-step__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="callout callout--warn">
          <b>本站不收款，也不提供捐赠入口</b>
          <p>
            页面上没有捐款按钮、收款码或患者账户。请不要通过本站向任何人转账；遇到“包装费”“推广费”“保证筹到”的说法，先停下来，向民政部门或官方平台核验。
          </p>
        </div>

        <div className="story-template" id="request-outline">
          <div className="story-template__head">
            <p className="eyebrow">求助信息模板</p>
            <h3>把“需要帮助”写成可核对的事实</h3>
            <p>
              下面是一份写作提纲，不是官方表单。发布前逐项确认，能用票据、诊断证明或结算单支撑的内容才写进去。
            </p>
          </div>
          <dl className="story-template__list">
            {requestOutline.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.text}</dd>
              </div>
            ))}
          </dl>
          <p className="field__hint">
            不要把孩子的正脸、证件号、病历号、学校全称或完整住址放进公开页面；需要核验身份时，只通过官方平台指定的私密通道提交。
          </p>
        </div>

        <div className="story-official">
          <h3>官方核验入口</h3>
          <ul className="plain-list plain-list--tight">
            <li>
              <a href="https://cszg.mca.gov.cn/" target="_blank" rel="noreferrer noopener">
                慈善中国
              </a>
              ：查询慈善组织公开募捐资格和募捐方案备案。
            </li>
            <li>
              <a href="https://www.mca.gov.cn/" target="_blank" rel="noreferrer noopener">
                民政部
              </a>
              ：查看慈善事业相关法规和办事信息。
            </li>
            <li>
              <Link to="/resources#jingning-xiaoludeng-phase5">景宁第五期「小鹿灯」资料卡</Link>
              ：查看公告明示的费用范围和申报时间。
            </li>
            <li>
              <Link to="/prepare">小鹿灯提交准备</Link>
              ：按“公告写明”和“请确认”两类整理材料。
            </li>
          </ul>
          <p className="field__hint">
            具体资格、材料和流程以官网及受理机构当前页面为准；无法确认时显示“待核对”，不做推测。
          </p>
        </div>
      </section>
    </>
  );
}
