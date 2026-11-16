import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildFundraisingDraft } from "@/src/domain/fundraising";
import { summarizeEntries, type ExpenseEntry } from "@/src/domain/ledger";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";

const platforms = [
  {
    id: "shuidichou",
    name: "水滴筹",
    url: "https://www.shuidichou.com/",
    kind: "个人大病求助平台",
    note: "是否可发起、需要哪些材料、如何审核，以平台当前页面为准。",
  },
  {
    id: "qschou",
    name: "轻松筹",
    url: "https://www.qschou.com/",
    kind: "个人大病求助平台",
    note: "是否可发起、需要哪些材料、如何审核，以平台当前页面为准。",
  },
] as const;

type PlatformId = (typeof platforms)[number]["id"];

function yuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

export function CrowdfundingAssistant() {
  const { entries } = useLedger();
  const { isDemo } = useWorkspace();
  const { docs } = useDocuments();
  const [platformId, setPlatformId] = useState<PlatformId>("shuidichou");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");

  const summary = useMemo(() => summarizeEntries(entries), [entries]);
  const platform = platforms.find((item) => item.id === platformId) ?? platforms[0];

  const linkedIndexes = (entry: ExpenseEntry) =>
    entry.documentIds
      .map((id) => docs.findIndex((doc) => doc.id === id) + 1)
      .filter((index) => index > 0)
      .sort((a, b) => a - b);

  function buildDraft(): string {
    return buildFundraisingDraft(entries, { platformName: platform.name, linkedIndexes });
  }

  async function generateAndCopy() {
    const text = buildDraft();
    setDraft(text);
    try {
      await navigator.clipboard.writeText(text);
      setStatus(
        `已生成并复制到剪贴板。请先核对数字，再自行打开${platform.name}，粘贴到平台表单。`,
      );
    } catch {
      setStatus("浏览器没有允许复制，请在下方文本框中手动选择并复制。");
    }
  }

  return (
    <section className="section" id="crowdfunding-assistant" aria-labelledby="crowdfunding-title">
      <div className="section__head">
        <div>
          <h2 className="section__title" id="crowdfunding-title">
            众筹准备助手
          </h2>
          <p className="section__note">
            从家庭账本里取已确认的分类合计，每个金额附上对应的原件序号，生成一份可核对的筹款说明草稿。只在本机生成和复制。
          </p>
        </div>
      </div>

      <div className="crowdfunding-layout">
        <div className="crowdfunding-panel">
          <fieldset className="crowdfunding-platforms">
            <legend>准备发布到</legend>
            {platforms.map((item) => (
              <label key={item.id} className="crowdfunding-platform">
                <input
                  type="radio"
                  name="crowdfunding-platform"
                  value={item.id}
                  checked={platformId === item.id}
                  onChange={() => {
                    setPlatformId(item.id);
                    setDraft("");
                    setStatus("");
                  }}
                />
                <span>
                  <b>{item.name}</b>
                  <small>{item.kind}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="crowdfunding-facts" aria-label="将从账本带入的数字">
            <div>
              <span>已确认账目</span>
              <b>{summary.entryCount} 笔</b>
            </div>
            <div>
              <span>有来源的费用总额</span>
              <b>
                {summary.amounts.totalFen.count > 0
                  ? `¥${yuan(summary.amounts.totalFen.fen)}`
                  : "未记录"}
              </b>
            </div>
            <div>
              <span>已到账公益救助</span>
              <b>{summary.aid.count > 0 ? `¥${yuan(summary.aid.fen)}` : "未记录"}</b>
            </div>
          </div>

          <p className="field__hint">
            {isDemo ? "当前是演示工作区，带入的是虚构账目。" : "当前是真实工作区。"}
            只统计家长已确认的账目；没有记录的金额保持「未记录」。
          </p>

          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={generateAndCopy}>
              一键生成并复制筹款说明
            </button>
            <a
              className="btn btn--ghost"
              href={platform.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              打开{platform.name}官方平台
            </a>
          </div>

          <p className="copy-feedback" role="status" aria-live="polite">
            {status}
          </p>

          <p className="field__hint">
            需要核对平台资质时，先到
            <a href="https://cszg.mca.gov.cn/" target="_blank" rel="noreferrer noopener">
              慈善中国
            </a>
            查询公开募捐资格和方案备案。个人求助平台的审核规则与公开募捐不同，以平台当前说明为准。
          </p>
        </div>

        <div className="crowdfunding-draft">
          <label className="field__label" htmlFor="crowdfunding-draft">
            筹款说明草稿（可编辑后再复制）
          </label>
          <textarea
            id="crowdfunding-draft"
            className="textarea crowdfunding-draft__text"
            rows={16}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="点击「一键生成并复制筹款说明」，这里会出现草稿。"
          />
          <p className="field__hint">
            发布前核对金额与票据、用途写具体；不公开孩子正脸、证件号、病历号或住址。
          </p>
          <p className="field__hint">
            已经有票据或账目？先到
            <Link to="/ledger">家庭费用</Link>
            确认账目，再回来生成。草稿只含分类合计、笔数和本机原件序号，每个金额都写明对应第几份原件。
          </p>
        </div>
      </div>
    </section>
  );
}
