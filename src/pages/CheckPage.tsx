import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CopyButton } from "@/src/components/CopyButton";
import { PageHeader } from "@/src/components/PageHeader";
import { policyResources } from "@/src/data/policies/resources";
import { findGapHints, gapHintsText } from "@/src/domain/gapCheck";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { usePlace } from "@/src/features/place/PlaceContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import { usePageTitle } from "@/src/lib/usePageTitle";

const resourcesById = new Map(policyResources.map((resource) => [resource.id, resource]));

export default function CheckPage() {
  usePageTitle("查漏");
  const { entries } = useLedger();
  const { modeLabel } = useWorkspace();
  const { placeLabel, regions } = usePlace();
  const hints = useMemo(() => findGapHints(entries), [entries]);
  const confirmedCount = entries.filter((entry) => entry.confirmed).length;
  const pendingCount = entries.length - confirmedCount;

  return (
    <>
      <PageHeader
        eyebrow="算清账 · 查漏"
        title="对照账本，看看还有哪些钱值得去问一句"
        lead="按你在家庭费用里已确认的账目逐笔对照：哪一层医保没有支付记录、哪些费用可能有别的渠道。这里只提醒去问什么、问谁，不判断能不能报，也不估算金额。"
      />

      <div className="status-strip" role="status">
        {modeLabel} · 已对照 {confirmedCount} 笔已确认账目 · 发现 {hints.length} 条可以去问的提醒
        {pendingCount > 0 ? ` · 另有 ${pendingCount} 笔待核对账目未参与对照` : ""}
      </div>

      <p className="meta-line">
        {regions ? (
          <>
            参保地：{placeLabel}，下面只列出全国统一制度和这个参保地已收录的原文。{" "}
            <Link to="/route">改参保地</Link>
          </>
        ) : (
          <>
            还没选参保地，原文按全部已收录资料列出。<Link to="/route">去选参保地</Link>
          </>
        )}
      </p>

      {confirmedCount === 0 ? (
        <section className="section" aria-labelledby="check-empty-title">
          <div className="section__head">
            <h2 className="section__title" id="check-empty-title">
              还没有可对照的账目
            </h2>
          </div>
          <p className="notice">
            先导入发票和医保结算单，在家庭费用里确认账目和金额，再回来查漏。没有录入的支付项不会被当成「没报」。
          </p>
          <div className="btn-row">
            <Link className="btn btn--primary" to="/receipts">
              去导入票据
            </Link>
            <Link className="btn btn--ghost" to="/ledger">
              去家庭费用
            </Link>
          </div>
        </section>
      ) : hints.length === 0 ? (
        <p className="notice">
          已确认的账目暂时没有触发提醒。新增账目或补录结算单后，这里会重新对照。
        </p>
      ) : (
        <section className="section" aria-labelledby="check-list-title">
          <div className="section__head">
            <h2 className="section__title" id="check-list-title">
              可以去问的 {hints.length} 件事
            </h2>
            <CopyButton text={gapHintsText(hints)}>复制全部问题</CopyButton>
          </div>
          <ol className="gap-list">
            {hints.map((hint) => (
              <li className="card gap-item" key={hint.id}>
                <h3 className="card__title">{hint.title}</h3>
                <p className="meta-line">
                  依据：
                  {hint.entries.map(({ entry, entryNumber }, index) => (
                    <span key={entry.id}>
                      {index > 0 && "、"}
                      <Link to={`/ledger#entry-${entry.id}`}>
                        第 {entryNumber} 笔 {entry.title || entry.category}
                      </Link>
                    </span>
                  ))}
                </p>
                <p className="card__body">{hint.why}</p>
                <p className="subhead">去问：{hint.askWho}</p>
                <ul className="plain-list plain-list--tight">
                  {hint.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
                <p className="meta-line">
                  原文：
                  {hint.resourceIds
                    .map((id) => resourcesById.get(id))
                    .filter((resource) => resource && (!regions || regions.has(resource.region)))
                    .map((resource, index) => (
                      <span key={resource!.id}>
                        {index > 0 && " · "}
                        <a href={resource!.sourceUrl} target="_blank" rel="noreferrer">
                          {resource!.title}
                        </a>
                      </span>
                    ))}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="callout">
        <p className="callout__title">提醒怎么来的</p>
        <p>
          只看账目里已经记录的字段：例如结算单录了统筹支付、没录大病保险支付，才提示问大病保险。没录入的字段保持「未记录」，可能只是还没补录。能不能报、能报多少，以参保地医保部门、民政部门和项目方的答复为准。
        </p>
      </div>

      <div className="btn-row">
        <Link className="btn btn--ghost" to="/ledger">
          回家庭费用
        </Link>
        <Link className="btn btn--ghost" to="/prepare">
          去提交准备
        </Link>
      </div>
    </>
  );
}
