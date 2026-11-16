import { useState } from "react";
import { flushSync } from "react-dom";
import { CopyButton } from "@/src/components/CopyButton";
import { formatFen, type LocalDocument } from "@/src/domain/documents";
import {
  buildCostStatement,
  costStatementText,
  type ExpenseEntry,
  type StatementKey,
} from "@/src/domain/ledger";

type Props = {
  entries: ExpenseEntry[];
  docs: LocalDocument[];
  sourceLabel: (entry: ExpenseEntry) => string;
  onPreview: (doc: LocalDocument) => void;
  onJump: (entryId: string) => void;
};

export function CostStatementCard({ entries, docs, sourceLabel, onPreview, onJump }: Props) {
  const statement = buildCostStatement(entries, sourceLabel);
  const [open, setOpen] = useState<Set<StatementKey>>(new Set());

  function toggle(key: StatementKey) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function printStatement() {
    const previous = open;
    flushSync(() => setOpen(new Set(statement.rows.map((row) => row.key))));
    document.body.classList.add("print-cost-statement");
    window.print();
    document.body.classList.remove("print-cost-statement");
    setOpen(previous);
  }

  return (
    <section className="section cost-statement" id="cost-statement" aria-labelledby="cost-title">
      <div className="section__head">
        <h2 className="section__title" id="cost-title">
          费用说明
        </h2>
        <p className="section__note">
          申请救助、和亲友说明情况时用；点开每个数字，看它来自哪几笔账目和原件
        </p>
      </div>
      <div className="card">
        <p className="meta-line">
          仅含已确认的 {statement.entryCount} 笔账目。每个数字只来自票据或到账记录上明确写出的金额，不做相减或推算；没有记录的显示「未记录」，不补零。
        </p>
        <ul className="cost-rows">
          {statement.rows.map((row) => {
            const expanded = open.has(row.key);
            const panelId = `cost-${row.key}`;
            return (
              <li key={row.key} className="cost-row">
                <button
                  type="button"
                  className="cost-row__toggle"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  disabled={!row.lines.length}
                  onClick={() => toggle(row.key)}
                >
                  <span className="cost-row__label">{row.label}</span>
                  <span className="cost-row__value">
                    {row.lines.length ? formatFen(String(row.fen)) : "未记录"}
                  </span>
                  <span className="cost-row__count">
                    {row.lines.length ? `覆盖 ${row.lines.length} 笔 ${expanded ? "▴" : "▾"}` : ""}
                  </span>
                </button>
                {expanded && (
                  <ul className="cost-lines" id={panelId}>
                    {row.lines.map((line) => {
                      const entry = entries.find((item) => item.id === line.entryId);
                      const linkedDocs = (entry?.documentIds ?? [])
                        .map((id) => docs.find((doc) => doc.id === id))
                        .filter((doc): doc is LocalDocument => doc !== undefined);
                      return (
                        <li key={line.entryId}>
                          <span>
                            第 {line.entryNumber} 笔 · {line.title} · {line.dateLabel} ·{" "}
                            <b>{formatFen(String(line.fen))}</b>
                          </span>
                          <span className="meta-line">原件：{line.sourceLabel}</span>
                          <span className="entry-source-list__actions">
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => onJump(line.entryId)}
                            >
                              看这笔账目
                            </button>
                            {linkedDocs.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                className="link-button"
                                onClick={() => onPreview(doc)}
                              >
                                查看第 {docs.indexOf(doc) + 1} 份原件
                              </button>
                            ))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <p className="meta-line">
          各支付项目分别来自结算单上的对应字段，彼此不相减；「个人现金支付」只取票面写明的数字。本说明由家庭自行整理，不代表任何机构的审核结果。
        </p>
        <div className="btn-row">
          <CopyButton text={costStatementText(statement)}>复制费用说明</CopyButton>
          <button type="button" className="btn btn--ghost" onClick={printStatement}>
            打印费用说明
          </button>
        </div>
      </div>
    </section>
  );
}
