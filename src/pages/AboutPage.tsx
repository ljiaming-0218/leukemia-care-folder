import { useState } from "react";
import { aidRules } from "@/src/data/policies/aidRules";
import { PageHeader } from "@/src/components/PageHeader";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { usePlace } from "@/src/features/place/PlaceContext";
import { usePrepareState } from "@/src/features/prepare/PrepareStateContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import { localStoreNote, saveValue, useLocalStoreStatus } from "@/src/lib/localStore";
import { routeStoreKey } from "@/src/domain/route";
import { usePageTitle } from "@/src/lib/usePageTitle";

const sources = [
  {
    label: "国家卫生健康委《儿童白血病救治管理工作材料》",
    url: "https://www.nhc.gov.cn/wjw/zccl/201810/9b618308636847d085ffef867370cacd.shtml",
  },
  {
    label: "儿童急性淋巴细胞白血病、儿童急性早幼粒细胞白血病诊疗规范（2018 年版）",
    url: "https://www.nhc.gov.cn/wjw/c100175/201810/bb6112cd824b476b8b6dc7495c3f7b42.shtml",
  },
  {
    label: "《儿童急性淋巴细胞白血病临床路径》（2019 年版，地方医保局刊载）",
    url: "https://ylbzj.qdn.gov.cn/lclj/xylptb/2019nb/202208/P020220817540095731889.pdf",
  },
  {
    label: "国家医保局三重保障制度说明",
    url: "https://www.nhsa.gov.cn/art/2024/9/10/art_14_13819.html",
  },
  {
    label: "浙江省医保局浙医保发〔2023〕39 号",
    url: "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3096/site/attach/0/e65965bb7279428e84c3f7066274f31d.pdf",
  },
  {
    label: "国家医保局跨省异地就医直接结算通知",
    url: "https://www.nhsa.gov.cn/art/2022/7/26/art_104_8629.html",
  },
  {
    label: "2025 年跨省异地就医经办说明",
    url: "https://www.nhsa.gov.cn/art/2025/6/7/art_14_16754.html",
  },
  {
    label: "门诊慢特病跨省结算办事问答",
    url: "https://www.nhsa.gov.cn/art/2025/7/19/art_14_17329.html",
  },
  {
    label: "财政部、国家卫健委、国家医保局医疗收费电子票据通知",
    url: "https://www.mof.gov.cn/gkml/caizhengwengao/wg201901/wg201908/201912/t20191230_3452059.htm",
  },
  {
    label: "阿里巴巴公益基金会健康公益项目",
    url: "https://www.alibabafoundation.com/projects/health",
  },
  {
    label: "景宁第五期「小鹿灯—愈见未来」申领公告",
    url: "https://finance.sina.com.cn/wm/2026-09-21/doc-inispyne8995961.shtml",
  },
  {
    label: "民政部「慈善中国」慈善组织与公开募捐信息查询",
    url: "https://cszg.mca.gov.cn/",
  },
  {
    label: "中华人民共和国民政部慈善事业信息",
    url: "https://www.mca.gov.cn/",
  },
  {
    label: "国家医保服务平台",
    url: "https://fuwu.nhsa.gov.cn/",
  },
  {
    label: "全国行政区划名录（2023-06-30 快照，仅用于选择参保地）",
    url: "https://github.com/modood/Administrative-divisions-of-China",
  },
  {
    label: "中国红十字基金会（小天使基金）",
    url: "https://www.crcf.org.cn/",
  },
  {
    label: "东南网（福建日报）：公益同行，撑起白血病儿童家庭的一片天",
    url: "https://fjnews.fjsen.com/wap/2023-11/03/content_31447939.htm",
  },
  {
    label: "新华网：用爱心托起生命的希望（中国网转载）",
    url: "https://news.china.com.cn/2026-11/11/content_118770857.shtml",
  },
  {
    label: "新快报：白血病治疗进入关键阶段 患儿家庭为治疗费用发愁（新浪财经转载）",
    url: "https://finance.sina.com.cn/tech/roll/2026-07-28/doc-inikhpyq8290628.shtml",
  },
  {
    label: "中国新闻网：关注家庭困难白血病患儿 各方携手助患儿过难关（新浪新闻转载）",
    url: "https://news.sina.cn/2021-11-24/detail-iktzscyy7537293.d.html",
  },
  {
    label: "新京报：走出「小白村」，白血病患儿重返校园之路（腾讯新闻转载）",
    url: "https://news.qq.com/rain/a/20210601A023CH00",
  },
];

export default function AboutPage() {
  usePageTitle("项目说明");

  const { modeLabel, isDemo } = useWorkspace();
  const storageNote = localStoreNote(useLocalStoreStatus(), false);
  const { resetAll } = usePrepareState();
  const { clearAll: clearDocuments } = useDocuments();
  const { clearLedger } = useLedger();
  const { clearPlace } = usePlace();
  const [cleared, setCleared] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="说明"
        title="使用边界、规则版本和资料来源"
        lead="本站帮助家庭整理公开资料和自己的票据。不判断救助资格，也不代替官方入口；公开政策以来源原文为准。"
      />

      <section className="section" aria-labelledby="rule-title">
        <div className="section__head">
          <h2 className="section__title" id="rule-title">
            已结构化的救助规则
          </h2>
        </div>
        {aidRules.map((rule) => (
          <div className="card" key={rule.id}>
            <h3 className="card__title">{rule.title}</h3>
            <dl className="kv" style={{ marginTop: 10 }}>
              <dt>规则 ID</dt>
              <dd>{rule.id}</dd>
              <dt>版本</dt>
              <dd>{rule.version}</dd>
              <dt>适用地区</dt>
              <dd>{rule.region}</dd>
              <dt>公告发布</dt>
              <dd>{rule.publishedAt}</dd>
              <dt>本站核对</dt>
              <dd>{rule.verifiedAt}</dd>
              <dt>费用发生时间</dt>
              <dd>
                {rule.expenseFrom} 至 {rule.expenseTo}
              </dd>
              <dt>申报时间</dt>
              <dd>{rule.deadlineText}</dd>
            </dl>
          </div>
        ))}
        <p className="meta-line" style={{ marginTop: 10 }}>
          目前只有上面这些规则做成了可对照的结构化清单，其他救助项目在「我家的路线」和「查漏」页列出原文和官方入口。已发布的规则内容、来源日期和核对日期随版本保留；正式文件更新后，通过发布新的规则版本修订。
        </p>
      </section>

      <section className="section" aria-labelledby="sources-title">
        <div className="section__head">
          <h2 className="section__title" id="sources-title">
            公开资料来源
          </h2>
          <p className="section__note">科普、路线、查漏和同路人页面分别标注来源；链接在新标签页打开官方原文</p>
        </div>
        <div className="card">
          <ul className="plain-list">
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="meta-line" style={{ marginTop: 12 }}>
            「同路人」页面摘自已公开发布的新闻报道，只保留与就医整理相关的事实，并标注报道来源、发布日期和本站核对日期。本页已对未成年人姓名和具体地点做去标识化处理，来源链接保留以便回原文核对。本站不收款、不提供捐赠入口，不审核、代办或代发筹款项目，也不为任何家庭背书。
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="assistant-title">
        <div className="section__head">
          <h2 className="section__title" id="assistant-title">
            AI 小助手
          </h2>
          <p className="section__note">只检索站内已核对资料</p>
        </div>
        <div className="card">
          <p className="card__body">
            小助手回答科普术语、医保入口、小鹿灯材料、公开报道故事和票据整理流程。它不联网，不读取票据、账本或文件，也不会根据症状、化验单或报告生成诊断、治疗方案、剂量或预后判断。涉及公开筹款的问题，它会说明官方救助与公开募捐的区别，并引导到「慈善中国」等官方入口核验。
          </p>
          <p className="card__body" style={{ marginTop: 8 }}>
            聊天内容只用于当前页面会话，不写入浏览器存储。请勿输入姓名、证件号、病历号、联系方式或票据内容；急症请直接联系治疗医院或就近急诊。
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-title">
        <div className="section__head">
          <h2 className="section__title" id="privacy-title">
            文件、浏览器和隐私
          </h2>
        </div>
        <div className="card">
          <ul className="plain-list">
            <li>票据识别和账本记录都在浏览器内完成，不把家长的票据发送给外部识别服务。</li>
            <li>每次最多导入 20 个文件、单文件 20 MB。这是网站处理限制，不是官方申报要求。</li>
            <li>原始文件独立保留，下载内容与导入字节一致；旋转、放大和识别使用副本。</li>
            <li>同路人故事来自公开报道，已对未成年人姓名、具体地点和精确日期做去标识化处理；不展示正脸、证件号、病历号或完整住址。</li>
            <li>
              演示工作区与真实工作区分开保存：首页「用示例体验」载入虚构票据，顶部横幅可返回真实工作区。演示备份只能恢复到演示工作区，真实备份也不能导入演示。
            </li>
            <li>
              当前版本没有上传入口。真实工作区的票据原件、账本和材料核对状态保存在这台设备的浏览器存储（IndexedDB）里，刷新或关闭页面后仍在；演示工作区不保存。换设备、清理浏览器数据或使用无痕窗口时不会保留。
              <span className="field__hint"> {storageNote}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="reset-title">
        <div className="section__head">
          <h2 className="section__title" id="reset-title">
            清空当前资料
          </h2>
        </div>
        <div className="card">
          <p className="card__body">
            只清空当前工作区（{modeLabel}）的票据原件、家庭账目、「我家的路线」里的参保地、就医地和进度，以及「提交准备」页的材料核对状态和原件关联；{isDemo ? "真实工作区的资料不受影响，可在顶部横幅返回后继续使用。" : "保存在本机浏览器里的这些资料会一并删除，不会改动演示工作区。"} 已导出的 CSV 或账本备份保存在浏览器下载目录中，不会被删除。
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                clearDocuments();
                clearLedger();
                resetAll();
                clearPlace();
                if (!isDemo) void saveValue(routeStoreKey, null);
                setCleared(true);
              }}
            >
              清空当前工作区资料
            </button>
          </div>
          <p className="copy-feedback" role="status" aria-live="polite">
            {cleared ? `已清空${modeLabel}中的票据、账目、参保地、路线进度和材料核对状态。` : ""}
          </p>
        </div>
      </section>
    </>
  );
}
