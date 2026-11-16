import { useState } from "react";
import {
  aidAmountFen,
  amountLabels,
  entryAmountFen,
  entryDateLabel,
  entryNeedsOriginals,
  faceAmountKeys,
  primaryAmountKeys,
  type ExpenseEntry,
} from "@/src/domain/ledger";
import { formatFen, safeDownloadName, type LocalDocument } from "@/src/domain/documents";
import { downloadOriginal } from "@/src/lib/download";

type ExpenseEntryCardProps = {
  entry: ExpenseEntry;
  index: number;
  docs: LocalDocument[];
  onPreview: (doc: LocalDocument) => void;
  onEdit: () => void;
  onRemove: () => void;
  onToggleConfirmed: () => void;
};

function recordTag(status: ExpenseEntry["amounts"]["totalFen"]["status"]): string {
  if (status === "原件明确") return "ok";
  if (status === "家长核对") return "warm";
  return "muted";
}

export function ExpenseEntryCard({
  entry,
  index,
  docs,
  onPreview,
  onEdit,
  onRemove,
  onToggleConfirmed,
}: ExpenseEntryCardProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const linked = entry.documentIds
    .map((id) => {
      const docIndex = docs.findIndex((doc) => doc.id === id);
      return docIndex >= 0 ? { doc: docs[docIndex], docIndex } : null;
    })
    .filter((item): item is { doc: LocalDocument; docIndex: number } => item !== null);
  const missingCount = entry.documentIds.length - linked.length;

  return (
    <article className="entry-card" id={`entry-${entry.id}`}>
      <header className="entry-card__head">
        <div>
          <p className="doc-card__seq">第 {index + 1} 笔</p>
          <h3 className="entry-card__title">{entry.title || "未命名账目"}</h3>
          <div className="tag-row">
            <span className={`tag tag--${entry.confirmed ? "ok" : "warm"}`}>
              {entry.confirmed ? "已计入统计" : "待核对，未计入"}
            </span>
            <span className="tag">{entry.category}</span>
            <span className={`tag tag--${entry.dateStatus === "已确认" ? "muted" : "warn"}`}>
              {entryDateLabel(entry)}
            </span>
            <span className={`tag ${missingCount > 0 ? "tag--warn" : "tag--muted"}`}>
              {linked.length
                ? `关联 ${linked.length} 份原件${missingCount > 0 ? `，缺失 ${missingCount} 份` : ""}`
                : missingCount > 0
                  ? `原件缺失 ${missingCount} 份`
                  : "原件未关联"}
            </span>
          </div>
        </div>
      </header>

      <div className="entry-card__amounts">
        <dl className="ledger-kv">
          {primaryAmountKeys.map((key) => {
            const fen = entryAmountFen(entry, key);
            const status = entry.amounts[key].status;
            return (
              <div className="ledger-kv__row" key={key}>
                <dt>{amountLabels[key]}</dt>
                <dd>
                  <span>{fen === null ? "未记录" : formatFen(String(fen))}</span>
                  {fen !== null && (
                    <span className={`tag tag--${recordTag(status)}`}>{status}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        <dl className="ledger-kv">
          {faceAmountKeys.map((key) => {
            const fen = entryAmountFen(entry, key);
            const status = entry.amounts[key].status;
            return (
              <div className="ledger-kv__row" key={key}>
                <dt>{amountLabels[key]}</dt>
                <dd>
                  <span>{fen === null ? "未记录" : formatFen(String(fen))}</span>
                  {fen !== null && (
                    <span className={`tag tag--${recordTag(status)}`}>{status}</span>
                  )}
                </dd>
              </div>
            );
          })}
          <div className="ledger-kv__row">
            <dt>已到账公益救助</dt>
            <dd>
              <span>
                {aidAmountFen(entry) === null
                  ? "未记录"
                  : formatFen(String(aidAmountFen(entry)))}
              </span>
              {aidAmountFen(entry) !== null && <span className="tag tag--ok">已到账</span>}
            </dd>
          </div>
        </dl>
      </div>

      {entry.aid.note && <p className="meta-line">救助说明：{entry.aid.note}</p>}
      {entry.note && <p className="entry-card__note">备注：{entry.note}</p>}

      <div className="entry-card__sources">
        <h4 className="subhead">来源原件</h4>
        {linked.length > 0 ? (
          <ul className="entry-source-list">
            {linked.map(({ doc, docIndex }) => (
              <li key={doc.id}>
                <span>
                  第 {docIndex + 1} 份 · {doc.archiveType} · 费用日期{" "}
                  {doc.fields.expenseDate.value || "待核对"} · 金额{" "}
                  {formatFen(doc.fields.amountFen.value)}
                </span>
                <span className="entry-source-list__actions">
                  <button type="button" className="link-button" onClick={() => onPreview(doc)}>
                    查看原件
                  </button>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => downloadOriginal(doc.file, safeDownloadName(doc, docIndex))}
                  >
                    下载
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : missingCount > 0 ? (
          <p className="notice notice--warn">
            有 {missingCount} 份已关联原件已从票据页移除，金额仍保留。可编辑账目重新关联。
          </p>
        ) : entryNeedsOriginals(entry) ? (
          <p className="notice">
            原件未关联；备份来源序号为第 {entry.sourceIndexes.join("、")} 份。提交前请重新选取原件。
          </p>
        ) : (
          <p className="notice">还没有关联原件。可编辑账目后选择已核对的原件。</p>
        )}
      </div>

      <div className="doc-actions">
        <button
          type="button"
          className={`btn ${entry.confirmed ? "btn--ghost" : "btn--primary"} btn--small`}
          onClick={onToggleConfirmed}
        >
          {entry.confirmed ? "改为待核对" : "确认计入统计"}
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={onEdit}>
          编辑账目
        </button>
        {confirmRemove ? (
          <span className="inline-confirm">
            <span>删除后原件会回到待归类，金额不再计入。</span>
            <button type="button" className="btn btn--danger btn--small" onClick={onRemove}>
              确认删除
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setConfirmRemove(false)}
            >
              取消
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setConfirmRemove(true)}
          >
            删除账目
          </button>
        )}
      </div>
    </article>
  );
}
