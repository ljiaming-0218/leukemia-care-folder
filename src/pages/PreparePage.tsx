import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentPreview } from "@/src/components/DocumentPreview";
import { PageHeader } from "@/src/components/PageHeader";
import { xiaoludengRule } from "@/src/data/policies/xiaoludeng";
import { formatFen, type LocalDocument } from "@/src/domain/documents";
import { materialStateValues, type MaterialState } from "@/src/domain/schemas";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { usePrepareState } from "@/src/features/prepare/PrepareStateContext";
import { usePageTitle } from "@/src/lib/usePageTitle";

const basisNotes: Record<string, string> = {
  公告写明: "公告直接列出的材料，逐份核对原件与项目名称。",
  请在官方入口确认: "材料种类和提交方式以支付宝页面为准。",
};

export default function PreparePage() {
  usePageTitle("小鹿灯提交准备");

  const { states, setState, linkedDocuments, linkDocument, unlinkDocument, reset, checkedCount, pendingCount, total } =
    usePrepareState();
  const { docs } = useDocuments();
  const { entries } = useLedger();
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [preview, setPreview] = useState<LocalDocument | null>(null);
  const percent = total === 0 ? 0 : Math.round((checkedCount / total) * 100);

  const groups = ["公告写明", "请在官方入口确认"] as const;

  const preferredDocIds = useMemo(
    () =>
      new Set(
        entries
          .filter(
            (entry) =>
              entry.confirmed &&
              (entry.category === "外购药" || entry.category === "基因检测"),
          )
          .flatMap((entry) => entry.documentIds),
      ),
    [entries],
  );

  const linkedTotal = Object.values(linkedDocuments).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );

  const sortedDocs = useMemo(() => {
    const withIndex = docs.map((doc, index) => ({ doc, index }));
    return withIndex.slice().sort((a, b) => {
      const preferredA = preferredDocIds.has(a.doc.id) ? 1 : 0;
      const preferredB = preferredDocIds.has(b.doc.id) ? 1 : 0;
      if (preferredA !== preferredB) return preferredB - preferredA;
      if (a.doc.confirmed !== b.doc.confirmed) return a.doc.confirmed ? -1 : 1;
      return a.index - b.index;
    });
  }, [docs, preferredDocIds]);

  return (
    <>
      <PageHeader
        eyebrow="提交准备 · 景宁第五期「小鹿灯」"
        title="按材料分区逐项核对"
        lead="清单分成「公告写明」和「请在官方入口确认」两组，页内只记录你的核对状态和关联原件。"
      />

      <article className="card" style={{ marginTop: "calc(22px * var(--site-space))" }}>
        <div className="card__head">
          <span className="tag tag--warm">专项救助</span>
          <span className="tag">公告发布 {xiaoludengRule.publishedAt}</span>
          <span className="tag tag--muted">本站核对 {xiaoludengRule.verifiedAt}</span>
        </div>
        <h2 className="card__title">{xiaoludengRule.title}</h2>
        <dl className="kv" style={{ marginTop: 12 }}>
          <dt>规则 ID</dt>
          <dd>{xiaoludengRule.id}</dd>
          <dt>规则版本</dt>
          <dd>{xiaoludengRule.version}</dd>
          <dt>费用发生时间</dt>
          <dd>
            {xiaoludengRule.expenseFrom} 至 {xiaoludengRule.expenseTo}（含首尾日期）
          </dd>
          <dt>申报时间</dt>
          <dd>{xiaoludengRule.deadlineText}</dd>
          <dt>咨询电话</dt>
          <dd>{xiaoludengRule.hotline}（浙江省青少年发展基金会热线，以公告为准）</dd>
          <dt>官方入口</dt>
          <dd>{xiaoludengRule.officialEntryText}</dd>
        </dl>
        <div className="callout">
          <p className="callout__title">截止时刻与受理状态</p>
          <p>公告未公开具体截止时刻和实时受理状态，提交前以支付宝页面或公告热线为准。</p>
        </div>
        <div className="btn-row">
          <a
            className="btn btn--primary"
            href={xiaoludengRule.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            查看官方申请指引
          </a>
          <a
            className="btn btn--ghost"
            href={xiaoludengRule.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            查看公告原文
          </a>
        </div>
      </article>

      <div className="progress-card">
        <div className="progress-card__row">
          <p className="progress-card__label">本页已核对 {checkedCount} / {total} 项</p>
          <p className="progress-card__value">待确认 {pendingCount} 项</p>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={checkedCount}
          aria-valuetext={`本页已核对 ${checkedCount} 项，共 ${total} 项`}
        >
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="meta-line">已关联 {linkedTotal} 份原件。</p>
        <div className="btn-row btn-row--tight">
          <button type="button" className="btn btn--ghost btn--small" onClick={reset}>
            清空本页核对状态与关联
          </button>
        </div>
      </div>

      {groups.map((basis) => {
        const items = xiaoludengRule.materialItems.filter((item) => item.basis === basis);
        return (
          <section className="material-group" key={basis} aria-labelledby={`basis-${basis}`}>
            <div className="material-group__head">
              <h2 className="material-group__title" id={`basis-${basis}`}>
                {basis}
              </h2>
              <p className="material-group__note">
                {basisNotes[basis]} 共 {items.length} 项
              </p>
            </div>
            {items.map((item) => {
              const selectId = `state-${item.id}`;
              const value: MaterialState = states[item.id] ?? "未准备";
              const linkedIds = linkedDocuments[item.id] ?? [];
              const linked = linkedIds
                .map((id) => {
                  const index = docs.findIndex((doc) => doc.id === id);
                  return index >= 0 ? { doc: docs[index], index } : null;
                })
                .filter((entry): entry is { doc: LocalDocument; index: number } => entry !== null);
              const missing = linkedIds.length - linked.length;
              return (
                <div className="material-item" key={item.id}>
                  <div className="material-item__top">
                    <h3 className="material-item__label">{item.label}</h3>
                    {basis === "公告写明" ? (
                      <span className="tag tag--accent">公告写明</span>
                    ) : (
                      <span className="tag tag--muted">请确认</span>
                    )}
                  </div>
                  <p className="material-item__note">{item.note}</p>
                  <div className="material-item__controls">
                    <label htmlFor={selectId}>我的状态</label>
                    <select
                      id={selectId}
                      className="select"
                      value={value}
                      onChange={(event) =>
                        setState(item.id, event.target.value as MaterialState)
                      }
                    >
                      {materialStateValues.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="material-links">
                    <div className="material-links__head">
                      <span>
                        已关联 {linked.length} 份原件
                        {missing > 0 ? ` · ${missing} 份原件已不在本批` : ""}
                      </span>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        aria-expanded={openPicker === item.id}
                        onClick={() =>
                          setOpenPicker(openPicker === item.id ? null : item.id)
                        }
                      >
                        {openPicker === item.id ? "收起原件列表" : "选择原件"}
                      </button>
                    </div>

                    {linked.length > 0 && (
                      <ul className="material-linked">
                        {linked.map(({ doc, index }) => (
                          <li key={doc.id}>
                            <span>
                              第 {index + 1} 份 · {doc.archiveType} · 费用日期{" "}
                              {doc.fields.expenseDate.value || "待核对"} · 金额{" "}
                              {formatFen(doc.fields.amountFen.value)}
                            </span>
                            <span className="entry-source-list__actions">
                              <button
                                type="button"
                                className="link-button"
                                onClick={() => setPreview(doc)}
                              >
                                查看原件
                              </button>
                              <button
                                type="button"
                                className="link-button"
                                onClick={() => unlinkDocument(item.id, doc.id)}
                              >
                                取消关联
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {openPicker === item.id && (
                      <div className="material-picker">
                        <p className="meta-line">
                          同一份不会重复关联。
                          {item.id === "m-applied-receipts"
                            ? " 账本中已确认的票据排在前面。"
                            : ""}
                        </p>
                        {sortedDocs.length ? (
                          <ul className="source-options">
                            {sortedDocs.map(({ doc, index }) => {
                              const checked = linkedIds.includes(doc.id);
                              const preferred = preferredDocIds.has(doc.id);
                              return (
                                <li key={doc.id}>
                                  <label className="source-option">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        checked
                                          ? unlinkDocument(item.id, doc.id)
                                          : linkDocument(item.id, doc.id)
                                      }
                                    />
                                    <span className="source-option__body">
                                      <span className="source-option__title">
                                        第 {index + 1} 份 · {doc.archiveType}
                                      </span>
                                      <span className="meta-line">
                                        费用日期 {doc.fields.expenseDate.value || "待核对"} · 金额{" "}
                                        {formatFen(doc.fields.amountFen.value)}
                                      </span>
                                      <span className="tag-row">
                                        {doc.confirmed ? (
                                          <span className="tag tag--ok">票据已核对</span>
                                        ) : (
                                          <span className="tag tag--warm">票据未核对</span>
                                        )}
                                        {preferred && (
                                          <span className="tag tag--accent">账本已确认</span>
                                        )}
                                      </span>
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="notice">
                            还没有导入原件。<Link to="/receipts">先去票据页导入</Link>，核对后再回来关联。
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <p className="notice">
        本页状态只在当前页面会话中保留。是否已提交由你在支付宝页面确认后自行设置。
      </p>

      <div className="btn-row">
        <Link className="btn btn--ghost" to="/ledger">
          回家庭费用账本
        </Link>
        <Link className="btn btn--ghost" to="/receipts">
          查看票据原件
        </Link>
      </div>

      {preview && (
        <DocumentPreview
          doc={preview}
          index={docs.findIndex((doc) => doc.id === preview.id)}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
