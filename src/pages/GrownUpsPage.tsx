import { Link } from "react-router-dom";
import { CellBuddy } from "@/src/components/story/CellBuddy";
import { SourceList } from "@/src/components/story/SourceList";
import { sources, type SourceId } from "@/src/data/story/sources";
import { clearAsked, useAskedDoctor } from "@/src/lib/askedDoctor";
import { clearStickers, useStickers } from "@/src/lib/stickers";
import { usePageTitle } from "@/src/lib/usePageTitle";

export default function GrownUpsPage() {
  usePageTitle("大人看这里");
  const stickers = useStickers();
  const asked = useAskedDoctor();

  return (
    <div className="page page--grownups">
      <Link to="/" className="back-link">
        ← 回到故事地图
      </Link>

      <header className="chapter-head">
        <span className="chapter-head__icon" aria-hidden="true">
          <CellBuddy kind="white" size={64} title="" />
        </span>
        <div>
          <p className="chapter-head__num">给爸爸妈妈</p>
          <h1 className="chapter-head__title">大人看这里</h1>
        </div>
      </header>
      <p className="page-lead">
        「骨髓小工厂」是讲给 6–12 岁、已经确诊白血病的孩子听的科普故事，适合家长陪孩子一起读。它帮助孩子理解自己身体里发生了什么。
      </p>

      <section className="info-block" aria-labelledby="how-title">
        <h2 id="how-title">怎么陪孩子读</h2>
        <ul>
          <li>一次读一两章就够了。圣犹达的家长指南建议按孩子的年龄给信息，分成几次简短的谈话。</li>
          <li>让孩子的问题带路。孩子问到你答不上来的，可以说「我们一起去问医生」。</li>
          <li>第 3 章特别重要：孩子常会以为生病是自己的错，或者会传染给别人。请明确告诉孩子都不是。</li>
          <li>第 7 章讲返校：什么时候回学校、怎么回应同学的提问，可以和治疗团队、学校一起商量。</li>
          <li>每章末尾的「大人看这里」写了这一章依据的原文和出处，可以先看再陪读。</li>
        </ul>
      </section>

      <section className="info-block" aria-labelledby="boundary-title">
        <h2 id="boundary-title">这些事交给治疗团队</h2>
        <ul>
          <li>孩子是否患病、属于哪一型、处于什么危险度，由治疗团队根据检查判断。</li>
          <li>血常规、骨髓、免疫分型、基因或脑脊液报告，由主治医生结合孩子的整体情况解释。</li>
          <li>治疗方案、药物剂量、疗程和预后，按孩子的主治医生安排。</li>
          <li>发烧、出血、剧烈疼痛等情况，请按治疗医院给你的要求立即联系医院。</li>
        </ul>
        <p>
          检查流程、麻醉方式和居家护理要求，按孩子所在医院的宣教来。
        </p>
      </section>

      <section className="info-block" aria-labelledby="community-title">
        <h2 id="community-title">同路人、康复和心里话</h2>
        <ul>
          <li>
            <Link to="/stories">同路人</Link>
            每篇都来自已刊发报道，隐去未成年人姓名、具体地点和精确日期。
          </li>
          <li>
            <Link to="/recovery">康复建议</Link>
            帮你整理生活提醒和就诊准备；康复训练在治疗团队或康复治疗师指导下进行。
          </li>
          <li>
            <Link to="/feelings">心里话</Link>
            孩子情绪持续低落、拒绝治疗或出现自伤言语时，请联系治疗团队或专业心理人员。
          </li>
        </ul>
      </section>

      <section className="info-block" aria-labelledby="privacy-title">
        <h2 id="privacy-title">隐私</h2>
        <p>
          网站不需要登录，不收集个人信息，也没有统计代码。保存在这台设备上的只有：孩子收集了哪几张贴纸（只有章节和场景编号），以及家长在康复卡片上勾选的「已经问过医生」（只有卡片编号）。情绪选择、问题卡和手足留言只留在当前页面，刷新就清空。
        </p>
        <div className="button-row">
          <button type="button" className="text-button" disabled={stickers.length === 0} onClick={clearStickers}>
            {stickers.length ? `清空贴纸记录（${stickers.length} 张）` : "没有贴纸记录"}
          </button>
          <button type="button" className="text-button" disabled={asked.length === 0} onClick={clearAsked}>
            {asked.length ? `清空「已问过医生」标记（${asked.length} 条）` : "没有问诊标记"}
          </button>
        </div>
      </section>

      <section className="info-block" aria-labelledby="sources-title">
        <h2 id="sources-title">全部来源（{sources.length} 份）</h2>
        <p>
          每条说法都对应下面的公开资料。「原文审核时间」是来源网页自己写的日期，「本站核对」是我们最近一次打开原文对照的日期。原文更新后以原文为准。
        </p>
        <SourceList ids={sources.map((source) => source.id as SourceId)} />
      </section>

      <p className="page-note">
        本站是 2026 Qoder 高校创造力大赛 Hack4Good 赛道的参赛作品。
        <Link to="/">回到故事地图</Link>
      </p>
    </div>
  );
}
