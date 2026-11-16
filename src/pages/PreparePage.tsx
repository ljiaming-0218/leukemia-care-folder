import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DocumentPreview } from "@/src/components/DocumentPreview";
import { PageHeader } from "@/src/components/PageHeader";
import { aidRules, unstructuredCharityResources } from "@/src/data/policies/aidRules";
import { groupEntriesByWindow, type WindowTag } from "@/src/domain/aidWindow";
import { formatFen, type LocalDocument } from "@/src/domain/documents";
import { materialStateValues, type MaterialState } from "@/src/domain/schemas";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { useAidRule } from "@/src/features/prepare/AidRuleContext";
import { usePrepareState } from "@/src/features/prepare/PrepareStateContext";
import { usePageTitle } from "@/src/lib/usePageTitle";

const basisNotes: Record<string, string> = {
  公告写明: "公告直接列出的材料，逐份核对原件与项目名称。",
  请在官方入口确认: "材料种类和提交方式以项目官方入口为准。",
};

const windowTagTone: Record<WindowTag, string> = { 窗口内: "ok", 窗口外: "warn", 日期待核对: "warn" };

const windowTagNote: Record<WindowTag, string> = {
  窗口内: "费用发生日期在公告时间段内。",
  窗口外: "费用发生日期不在公告时间段内。",
  日期待核对: "账目还没有确认的费用发生日期，先在账本里核对。",
};

export default function PreparePage() {
  usePageTitle("提交准备");
  const { rule, selectRule } = useAidRule();
  const [params, setParams] = useSearchParams();
  const requestedRule = params.get("rule");

  useEffect(() => {
    if (requestedRule) selectRule(requestedRule);
  }, [requestedRule, selectRule]);

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
              (rule.eligibleCategories as string[]).includes(entry.category),
          )
          .flatMap((entry) => entry.documentIds),
      ),
    [entries, rule],
  );

  const windowGroups = useMemo(() => groupEntriesByWindow(entries, rule), [entries, rule]);

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
        eyebrow={`提交准备 · ${rule.title}`}
        title="按材料分区逐项核对"
        lead="先选要准备的救助项目，再对照账本里哪些费用在它的费用时间段内。材料清单分成「公告写明」和「请在官方入口确认」两组，页内只记录你的核对状态和关联原件。"
      />

      <section className="section" aria-labelledby="rule-picker-title">
        <div className="section__head">
          <h2 className="section__title" id="rule-picker-title">
            选择救助项目
          </h2>
        </div>
        <div className="chip-group" role="group" aria-label="已做成清单的救助项目">
          {aidRules.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === rule.id}
              onClick={() => setParams({ rule: item.id }, { replace: true })}
            >
              {item.shortName} · {item.region}
            </button>
          ))}
        </div>
        {unstructuredCharityResources.length > 0 && (
          <div className="notice" style={{ marginTop: 12 }}>
            <p style={{ margin: 0 }}>
              下面这些项目本站还没有做成逐项清单，请按资料卡里的原文和官方入口准备：
            </p>
            <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
              {unstructuredCharityResources.map((resource) => (
                <li key={resource.id}>
                  <Link to={`/resources#${resource.id}`}>{resource.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <article className="card" style={{ marginTop: "calc(22px * var(--site-space))" }}>
        <div className="card__head">
          <span className="tag tag--warm">专项救助</span>
          <span className="tag">公告发布 {rule.publishedAt}</span>
          <span className="tag tag--muted">本站核对 {rule.verifiedAt}</span>
        </div>
        <h2 className="card__title">{rule.title}</h2>
        <dl className="kv" style={{ marginTop: 12 }}>
          <dt>适用地区</dt>
          <dd>{rule.region}</dd>
          <dt>公告对象</dt>
          <dd>{rule.scopeText}</dd>
          <dt>公告费用类型</dt>
          <dd>{rule.eligibleCategories.join("、")}</dd>
          <dt>规则 ID</dt>
          <dd>{rule.id}</dd>
          <dt>规则版本</dt>
          <dd>{rule.version}</dd>
          <dt>费用发生时间</dt>
          <dd>
            {rule.expenseFrom} 至 {rule.expenseTo}（含首尾日期）
          </dd>
          <dt>申报时间</dt>
          <dd>{rule.deadlineText}</dd>
          {rule.hotline && (
            <>
              <dt>咨询电话</dt>
              <dd>
                {rule.hotline}
                {rule.hotlineNote ? `（${rule.hotlineNote}）` : ""}
              </dd>
            </>
          )}
          <dt>官方入口</dt>
          <dd>{rule.officialEntryText}</dd>
        </dl>
        <div className="callout">
          <p className="callout__title">截止时刻与受理状态</p>
          <p>公告未公开具体截止时刻和实时受理状态，提交前以官方入口或公告电话为准。是否符合条件由项目方审核，本页不做判断。</p>
        </div>
        <div className="btn-row">
          <a
            className="btn btn--primary"
            href={rule.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            查看官方申请指引
          </a>
          <a
            className="btn btn--ghost"
            href={rule.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            查看公告原文
          </a>
        </div>
      </article>

      <section className="section" aria-labelledby="window-title">
        <div className="section__head">
          <h2 className="section__title" id="window-title">
            账本里能对照的费用
          </h2>
          <p className="section__note">
            只看已确认的「{rule.eligibleCategories.join("」「")}」账目，按费用发生日期对照 {rule.expenseFrom} 至{" "}
            {rule.expenseTo}。窗口外的票据仍可用于医保报销或其他救助；是否属于本项目费用以项目方审核为准。
          </p>
        </div>
        <ul className="cost-rows">
          {windowGroups.map((group) => (
            <li key={group.tag}>
              <div className="cost-row__toggle" style={{ cursor: "default" }}>
                <span className="cost-row__label">
                  <span className={`tag tag--${windowTagTone[group.tag]}`}>{group.tag}</span>{" "}
                  {group.entries.length} 笔
                </span>
                <span className="cost-row__value">
                  {group.totalCount ? formatFen(String(group.totalFen)) : "未记录"}
                </span>
                <span className="cost-row__count">
                  {windowTagNote[group.tag]}
                  {group.entries.length > 0 && ` 费用总额覆盖 ${group.totalCount} 笔。`}
                </span>
              </div>
              {group.entries.length > 0 && (
                <ul className="cost-lines">
                  {group.entries.map(({ entry, entryNumber }) => (
                    <li key={entry.id}>
                      <span>
                        第 {entryNumber} 笔 · {entry.title || entry.category} ·{" "}
                        {entry.expenseDate || "日期待核对"}
                      </span>
                      <Link to={`/ledger#entry-${entry.id}`}>在账本里查看</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
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
        const items = rule.materialItems.filter((item) => item.basis === basis);
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
                          {item.basis === "公告写明"
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
        核对状态和原件关联随工作区保存在本机。是否已提交由你在官方入口确认后自行设置。
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
