import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CopyButton } from "@/src/components/CopyButton";
import { DocumentPreview } from "@/src/components/DocumentPreview";
import { ExpenseEntryCard } from "@/src/components/ExpenseEntryCard";
import { ExpenseEntryForm } from "@/src/components/ExpenseEntryForm";
import { PageHeader } from "@/src/components/PageHeader";
import { xiaoludengRule } from "@/src/data/policies/xiaoludeng";
import {
  amountLabels,
  backupToEntries,
  buildLedgerCsv,
  buildSummaryText,
  createBackup,
  entryMonthKey,
  expenseCategories,
  faceAmountKeys,
  ledgerBackupSchema,
  nearMatchReasons,
  primaryAmountKeys,
  summarizeByCategory,
  summarizeByMonth,
  summarizeEntries,
  unknownMonthLabel,
  workspaceMismatchMessage,
  type AmountSummary,
  type ExpenseCategory,
  type LedgerBackup,
} from "@/src/domain/ledger";
import { formatFen, safeDownloadName, type LocalDocument } from "@/src/domain/documents";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { downloadStamp, localToday, useLedger } from "@/src/features/ledger/LedgerContext";
import { useWorkspace, type WorkspaceMode } from "@/src/features/workspace/WorkspaceContext";
import { downloadOriginal, downloadText } from "@/src/lib/download";
import { usePageTitle } from "@/src/lib/usePageTitle";

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

function sourceLabelFor(entry: { documentIds: string[]; sourceIndexes: number[] }, docs: LocalDocument[]) {
  if (entry.documentIds.length) {
    return entry.documentIds
      .map((id) => {
        const index = docs.findIndex((doc) => doc.id === id);
        return index >= 0 ? `第 ${index + 1} 份` : null;
      })
      .filter(Boolean)
      .join("、");
  }
  return entry.sourceIndexes.map((index) => `第 ${index} 份（原件未关联）`).join("、");
}

function currentIndexes(entry: { documentIds: string[]; sourceIndexes: number[] }, docs: LocalDocument[]) {
  if (!entry.documentIds.length) return entry.sourceIndexes;
  return entry.documentIds
    .map((id) => docs.findIndex((doc) => doc.id === id) + 1)
    .filter((index) => index > 0);
}

async function sha256Text(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function AmountCell({ amount }: { amount: AmountSummary }) {
  if (!amount.count) return <span className="table-muted">未记录</span>;
  return (
    <>
      <span>{formatFen(String(amount.fen))}</span>
      <small className="table-count">覆盖 {amount.count} 笔</small>
    </>
  );
}

export default function LedgerPage() {
  usePageTitle("家庭费用");
  const { mode, isDemo, modeLabel } = useWorkspace();
  const { docs } = useDocuments();
  const {
    entries,
    usedDocumentIds,
    addEntry,
    updateEntry,
    removeEntry,
    setConfirmed,
    replaceEntries,
    clearLedger,
    lastImport,
  } = useLedger();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<LocalDocument | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<"全部" | ExpenseCategory>("全部");
  const [filterMonth, setFilterMonth] = useState("全部");
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    backup: LedgerBackup;
    fingerprint: string;
    targetMode: WorkspaceMode;
  } | null>(null);
  const [importError, setImportError] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  const confirmedDocs = useMemo(
    () =>
      docs
        .map((doc, index) => ({ doc, index }))
        .filter(({ doc }) => doc.confirmed),
    [docs],
  );
  const unassigned = confirmedDocs.filter(({ doc }) => !usedDocumentIds.has(doc.id));
  const unconfirmedCount = docs.filter((doc) => !doc.confirmed).length;

  const summary = useMemo(() => summarizeEntries(entries), [entries]);
  const countedEntries = entries.filter((entry) => entry.confirmed);
  const pendingEntries = entries.filter((entry) => !entry.confirmed);
  const categoryRows = useMemo(() => summarizeByCategory(entries), [entries]);
  const months = useMemo(
    () => Array.from(new Set(entries.map((entry) => entryMonthKey(entry)))).sort((a, b) => {
      if (a === unknownMonthLabel) return 1;
      if (b === unknownMonthLabel) return -1;
      return b.localeCompare(a);
    }),
    [entries],
  );
  const filteredEntries = entries.filter(
    (entry) =>
      (filterCategory === "全部" || entry.category === filterCategory) &&
      (filterMonth === "全部" || entryMonthKey(entry) === filterMonth),
  );
  const visibleEntries = filteredEntries.slice().sort((a, b) => {
    if (a.confirmed !== b.confirmed) return a.confirmed ? 1 : -1;
    return (b.expenseDate || "").localeCompare(a.expenseDate || "");
  });
  const monthRows = useMemo(
    () => summarizeByMonth(filteredEntries),
    [filteredEntries],
  );
  const editingEntry = editingId ? entries.find((entry) => entry.id === editingId) : undefined;
  const restoredUnlinked = entries.filter(
    (entry) => entry.confirmed && entry.documentIds.length === 0 && entry.sourceIndexes.length > 0,
  );
  const nearMatchCount = restoredUnlinked.filter((entry) =>
    confirmedDocs.some(({ doc }) => nearMatchReasons(entry, doc).length > 0),
  ).length;
  const summaryText = buildSummaryText(entries, (entry) => sourceLabelFor(entry, docs));

  const toggleSelected = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const exportCsv = () => {
    const csv = buildLedgerCsv(countedEntries, {
      today: localToday(),
      workspaceLabel: isDemo ? "演示工作区（虚构数据）" : "真实工作区",
      sourceLabel: (entry) => sourceLabelFor(entry, docs),
    });
    downloadText(
      `\uFEFF${csv}`,
      `${isDemo ? "演示-" : ""}费用账本-${downloadStamp()}.csv`,
      "text/csv;charset=utf-8",
    );
    setFeedback({
      tone: "ok",
      text: `已导出 ${countedEntries.length} 笔已确认账目。CSV 不含姓名、证件号、联系方式和报告正文。`,
    });
  };

  const exportBackup = () => {
    const backup = createBackup(entries, {
      exportedAt: new Date().toISOString(),
      ruleId: xiaoludengRule.id,
      mode,
      sourceIndexes: (entry) => currentIndexes(entry, docs),
    });
    downloadText(
      JSON.stringify(backup, null, 2),
      `${isDemo ? "演示-" : ""}费用账本备份-${downloadStamp()}.json`,
      "application/json;charset=utf-8",
    );
    setFeedback({
      tone: "ok",
      text: `已导出 ${backup.entries.length} 笔已确认账目的备份。备份包含家庭费用，请妥善保存；不含原件和身份信息。`,
    });
  };

  const handleImportFile = async (files: FileList | null) => {
    setImportError("");
    setPendingImport(null);
    if (!files || !files.length) return;
    const file = files[0];
    const resetInput = () => {
      if (importInputRef.current) importInputRef.current.value = "";
    };
    if (file.size > MAX_BACKUP_BYTES) {
      setImportError("备份文件超过 2 MB，当前账目未改动。");
      resetInput();
      return;
    }
    const text = await file.text();
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      setImportError("文件不是有效的 JSON，当前账目未改动。");
      resetInput();
      return;
    }
    const version =
      typeof raw === "object" && raw !== null && "schemaVersion" in raw
        ? (raw as { schemaVersion?: unknown }).schemaVersion
        : undefined;
    if (version !== 1) {
      setImportError(
        version === undefined
          ? "这不是本工具的账本备份（缺少 schemaVersion），当前账目未改动。"
          : `备份版本 ${String(version)} 不支持，当前账目未改动。`,
      );
      resetInput();
      return;
    }
    const parsed = ledgerBackupSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setImportError(
        `备份校验没有通过：${issue.path.join(".") || "文件结构"} ${issue.message}。当前账目未改动。`,
      );
      resetInput();
      return;
    }
    const mismatch = workspaceMismatchMessage(parsed.data.mode, mode);
    if (mismatch) {
      setImportError(mismatch);
      resetInput();
      return;
    }
    const fingerprint = await sha256Text(text);
    if (lastImport?.fingerprint === fingerprint && entries.length > 0) {
      setImportError("这份备份已经导入过；当前账目没有改动。需要重新开始时，请先清空或导出当前账本。");
      resetInput();
      return;
    }
    setPendingImport({ backup: parsed.data, fingerprint, targetMode: mode });
    resetInput();
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    if (pendingImport.targetMode !== mode) {
      setPendingImport(null);
      setImportError("工作区已切换，导入已取消。请回到原工作区或重新选择备份。");
      return;
    }
    const mismatch = workspaceMismatchMessage(pendingImport.backup.mode, mode);
    if (mismatch) {
      setPendingImport(null);
      setImportError(mismatch);
      return;
    }
    const restored = backupToEntries(pendingImport.backup);
    replaceEntries(pendingImport.targetMode, restored, {
      fingerprint: pendingImport.fingerprint,
      exportedAt: pendingImport.backup.exportedAt,
    });
    setPendingImport(null);
    setSelectedIds([]);
    setCreating(false);
    setEditingId(null);
    setFilterCategory("全部");
    setFilterMonth("全部");
    setFeedback({
      tone: "ok",
      text: `已恢复 ${restored.length} 笔账目。原件未关联，金额继续按已确认口径统计；提交前请重新选择原件。`,
    });
  };

  const backupTotal = pendingImport
    ? pendingImport.backup.entries.reduce((total, entry) => {
        const record = entry.amounts.totalFen;
        return record.value ? total + Number(record.value) : total;
      }, 0)
    : 0;
  const backupSourceWarnings = pendingImport
    ? (() => {
        const seen = new Map<number, number>();
        pendingImport.backup.entries.forEach((entry) => {
          entry.sourceIndexes.forEach((index) => {
            seen.set(index, (seen.get(index) ?? 0) + 1);
          });
        });
        return Array.from(seen.entries())
          .filter(([, count]) => count > 1)
          .map(([index]) => index);
      })()
    : [];

  return (
    <>
      <PageHeader
        eyebrow="家庭费用与票据夹 · 第二步"
        title="按一次就诊记账，金额各记各的"
        lead="账本按家长确认的就诊批次或独立支出建立。同一次住院的发票、费用清单和结算单可归入一笔，同一份原件最多计入一次。"
      />

      <p className="notice" role="note">
        当前为{modeLabel}，账本只在当前页面会话中保留。离开前可导出 CSV 或账本备份。
      </p>

      <div className="status-strip" role="status">
        已计入 {countedEntries.length} 笔 · 待核对 {pendingEntries.length} 笔 · 已核对原件{" "}
        {confirmedDocs.length} 份，其中 {confirmedDocs.length - unassigned.length} 份已归入账目
        {unconfirmedCount > 0 ? ` · 另有 ${unconfirmedCount} 份原件未核对` : ""}
      </div>

      {(confirmedDocs.length > 0 || entries.length > 0) && (
        <section className="section" aria-labelledby="summary-title">
          <div className="section__head">
            <h2 className="section__title" id="summary-title">
              本账本汇总
            </h2>
            <p className="section__note">仅含家长已确认的账目，每个金额显示覆盖笔数</p>
          </div>
          <div className="stat-grid">
            {primaryAmountKeys.map((key) => (
              <div className="stat" key={key}>
                <span className="stat__label">{amountLabels[key]}</span>
                <span className="stat__value">
                  {summary.amounts[key].count
                    ? formatFen(String(summary.amounts[key].fen))
                    : "未记录"}
                </span>
                <span className="stat__count">
                  覆盖 {summary.amounts[key].count} 笔
                </span>
              </div>
            ))}
          </div>
          <div className="stat-face">
            {faceAmountKeys.map((key) => (
              <p key={key}>
                <span>{amountLabels[key]}</span>
                <b>
                  {summary.amounts[key].count
                    ? `${formatFen(String(summary.amounts[key].fen))}（${summary.amounts[key].count} 笔）`
                    : "未记录"}
                </b>
              </p>
            ))}
            <p>
              <span>已到账公益救助</span>
              <b>
                {summary.aid.count
                  ? `${formatFen(String(summary.aid.fen))}（${summary.aid.count} 笔）`
                  : "未记录"}
              </b>
            </p>
          </div>
          <p className="meta-line">
            「个人自付」「个人自费」「其他支付」按票面原标签各自展示，不与统筹支付相加。
          </p>
        </section>
      )}

      {docs.length === 0 && entries.length === 0 && (
        <section className="section" aria-labelledby="empty-title">
          <div className="section__head">
            <h2 className="section__title" id="empty-title">
              还没有可记账的原件
            </h2>
          </div>
          <p className="notice">
            先在「票据导入」页导入发票和结算单，逐份核对字段和金额；确认后的原件才能归入账目。也可以导入以前导出的账本备份。
          </p>
          <div className="btn-row">
            <Link className="btn btn--primary" to="/receipts">
              去导入票据
            </Link>
            <Link className="btn btn--ghost" to="/learn">
              先看票据字段怎么区分
            </Link>
          </div>
        </section>
      )}

      {nearMatchCount > 0 && (
        <div className="issue-panel" role="note">
          <h2 className="subhead">恢复的账目与当前原件可能有对应关系</h2>
          <p className="meta-line">
            有 {nearMatchCount} 笔恢复账目与当前已核对原件的费用日期或金额相同。请打开账目核对归属后再关联。
          </p>
        </div>
      )}

      <section className="section" aria-labelledby="build-title">
        <div className="section__head">
          <h2 className="section__title" id="build-title">
            建立账目
          </h2>
          <p className="section__note">
            同一次就诊的发票、费用清单和结算单选在一起
          </p>
        </div>

        {unassigned.length > 0 ? (
          <>
            <p className="meta-line">
              待归入账目的已核对原件。勾选同一批次或同一笔独立支出，再新建一笔。
            </p>
            <ul className="assign-list">
              {unassigned.map(({ doc, index }) => (
                <li key={doc.id}>
                  <label className="source-option">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(doc.id)}
                      onChange={() => toggleSelected(doc.id)}
                    />
                    <span className="source-option__body">
                      <span className="source-option__title">
                        第 {index + 1} 份 · {doc.archiveType}
                      </span>
                      <span className="meta-line">
                        费用日期 {doc.fields.expenseDate.value || "待核对"} · 金额{" "}
                        {formatFen(doc.fields.amountFen.value)}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selectedIds.length || creating}
                onClick={() => setCreating(true)}
              >
                新建一笔账目{selectedIds.length ? `（已选 ${selectedIds.length} 份）` : ""}
              </button>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setSelectedIds([])}
                >
                  取消选择
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="notice">
            {confirmedDocs.length === 0
              ? "还没有已核对的原件。先在票据页逐份核对，再回来建立账目。"
              : entries.length > 0
                ? "所有已核对原件都已归入账目。新导入并核对的原件会出现在这里。"
                : "没有待归入账目的原件。"}
          </p>
        )}

        {unconfirmedCount > 0 && (
          <p className="notice">
            还有 {unconfirmedCount} 份原件未核对，暂不能归入账目。金额和费用日期核对后才能进入统计。
            <Link to="/receipts"> 去核对票据</Link>
          </p>
        )}

        {creating && (
          <ExpenseEntryForm
            heading="新建一笔账目"
            intro="保存后先记为待核对；勾选确认后，金额才会进入统计。"
            docs={docs}
            usedDocumentIds={usedDocumentIds}
            preselectedIds={selectedIds}
            onSave={(entry) => {
              const result = addEntry(entry);
              if (result.ok) {
                setCreating(false);
                setSelectedIds([]);
                setFeedback({
                  tone: "ok",
                  text: entry.confirmed
                    ? "账目已保存并计入统计。金额按各字段来源分别展示。"
                    : "账目已保存。核对金额和日期后确认计入统计。",
                });
              }
              return result;
            }}
            onCancel={() => setCreating(false)}
          />
        )}
      </section>

      <section className="section" aria-labelledby="entries-title">
        <div className="section__head">
          <h2 className="section__title" id="entries-title">
            账目明细
          </h2>
          <p className="section__note" role="status">
            已计入 {countedEntries.length} 笔 · 待核对 {pendingEntries.length} 笔
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="notice">还没有账目。核对原件后，在上方选择同一批次的文件建立第一笔。</p>
        ) : (
          <>
            <div className="ledger-filters">
              <div className="chip-group" role="group" aria-label="按类别筛选账目">
                <button
                  type="button"
                  className="chip"
                  aria-pressed={filterCategory === "全部"}
                  onClick={() => setFilterCategory("全部")}
                >
                  全部
                  <span className="chip__count">{entries.length}</span>
                </button>
                {expenseCategories.map((category) => {
                  const count = entries.filter((entry) => entry.category === category).length;
                  if (!count) return null;
                  const row = categoryRows.find((item) => item.category === category);
                  return (
                    <button
                      key={category}
                      type="button"
                      className="chip"
                      aria-pressed={filterCategory === category}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                      <span className="chip__count">
                        {row ? row.entryCount : 0}/{count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="field ledger-filters__month">
                <span className="field__label">月份</span>
                <select
                  className="select"
                  value={filterMonth}
                  onChange={(event) => setFilterMonth(event.target.value)}
                >
                  <option value="全部">全部月份</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="meta-line">
              类别按钮上的数字为「已计入/全部账目」。
            </p>

            {editingEntry && (
              <ExpenseEntryForm
                key={editingEntry.id}
                heading="修改账目"
                intro="修改后先回到待核对；重新勾选确认后才会进入统计。"
                docs={docs}
                usedDocumentIds={usedDocumentIds}
                initial={editingEntry}
                onSave={(entry) => {
                  const result = updateEntry(editingEntry.id, entry);
                  if (result.ok) {
                    setEditingId(null);
                    setFeedback({
                      tone: "ok",
                      text: "修改已保存。金额和日期重新核对并确认后，才会再次计入统计。",
                    });
                  }
                  return result;
                }}
                onCancel={() => setEditingId(null)}
              />
            )}

            <div className="entry-list">
              {visibleEntries.map((entry) => (
                <ExpenseEntryCard
                  key={entry.id}
                  entry={entry}
                  index={entries.indexOf(entry)}
                  docs={docs}
                  onPreview={setPreview}
                  onEdit={() => setEditingId(entry.id)}
                  onRemove={() => {
                    removeEntry(entry.id);
                    if (editingId === entry.id) setEditingId(null);
                    setFeedback({ tone: "ok", text: "账目已删除，关联原件已回到待归类。" });
                  }}
                  onToggleConfirmed={() => {
                    const next = !entry.confirmed;
                    setConfirmed(entry.id, next);
                    setFeedback({
                      tone: next ? "ok" : "warn",
                      text: next
                        ? "已确认计入统计。金额仍按各字段来源分别展示。"
                        : "已改为待核对，这笔账目不再进入统计。",
                    });
                  }}
                />
              ))}
            </div>
            {visibleEntries.length === 0 && (
              <p className="notice">当前筛选没有账目。调整类别或月份后再看。</p>
            )}
          </>
        )}
      </section>

      {countedEntries.length > 0 && (
        <section className="section" aria-labelledby="months-title">
          <div className="section__head">
            <h2 className="section__title" id="months-title">
              按月份汇总
            </h2>
            <p className="section__note">只含已确认账目；日期待核对单独一行</p>
          </div>
          <div
            className="table-scroll"
            role="region"
            aria-label="按月份汇总表，可横向滚动"
            tabIndex={0}
          >
            <table className="ledger-table">
              <thead>
                <tr>
                  <th scope="col">月份</th>
                  <th scope="col">笔数</th>
                  {primaryAmountKeys.map((key) => (
                    <th scope="col" key={key}>
                      {amountLabels[key]}
                    </th>
                  ))}
                  <th scope="col">已到账救助</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map((row) => (
                  <tr key={row.month}>
                    <th scope="row">{row.month}</th>
                    <td>{row.entryCount}</td>
                    {primaryAmountKeys.map((key) => (
                      <td key={key}>
                        <AmountCell amount={row.amounts[key]} />
                      </td>
                    ))}
                    <td>
                      <AmountCell amount={row.aid} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {monthRows.length === 0 && <p className="notice">当前筛选没有已确认账目。</p>}
          <p className="meta-line">
            每个金额标注实际覆盖笔数；没有记录的项目保持「未记录」。
          </p>
        </section>
      )}

      <section className="section" aria-labelledby="export-title">
        <div className="section__head">
          <h2 className="section__title" id="export-title">
            导出、打印与备份
          </h2>
          <p className="section__note">
            CSV 与清单只含已确认账目；备份用于下次继续记
          </p>
        </div>

        <div className="btn-row">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!countedEntries.length}
            onClick={exportCsv}
          >
            导出 CSV 费用表
          </button>
          {countedEntries.length > 0 && <CopyButton text={summaryText}>复制整理清单</CopyButton>}
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!countedEntries.length}
            onClick={() => window.print()}
          >
            打印整理清单
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!countedEntries.length}
            onClick={exportBackup}
          >
            导出账本备份（JSON）
          </button>
          <label className="btn btn--ghost file-picker">
            导入账本备份
            <input
              ref={importInputRef}
              type="file"
              className="file-picker__input"
              accept=".json,application/json"
              aria-label="选择账本备份 JSON 文件"
              onChange={(event) => {
                if (event.target.files) void handleImportFile(event.target.files);
              }}
            />
          </label>
          {entries.length > 0 &&
            (confirmClear ? (
              <span className="inline-confirm">
                <span>清空后账目和统计会一起移除，原件仍保留在票据页。</span>
                <button
                  type="button"
                  className="btn btn--danger btn--small"
                  onClick={() => {
                    clearLedger();
                    setConfirmClear(false);
                    setEditingId(null);
                    setCreating(false);
                    setSelectedIds([]);
                    setFeedback({ tone: "ok", text: "账本已清空；票据原件仍保留在本次会话中。" });
                  }}
                >
                  确认清空
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => setConfirmClear(false)}
                >
                  取消
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setConfirmClear(true)}
              >
                清空账本
              </button>
            ))}
        </div>

        {feedback && (
          <p className="callout" role="status">
            {feedback.text}
          </p>
        )}
        {importError && (
          <p className="notice notice--warn" role="alert">
            {importError}
          </p>
        )}

        {pendingImport && (
          <div className="import-panel">
            <h3 className="subhead">导入前预览</h3>
            <dl className="kv">
              <dt>备份版本</dt>
              <dd>
                schemaVersion {pendingImport.backup.schemaVersion} ·{" "}
                {pendingImport.backup.mode === "demo" ? "演示工作区" : "真实工作区"}
              </dd>
              <dt>导出时间</dt>
              <dd>{pendingImport.backup.exportedAt}</dd>
              <dt>账目</dt>
              <dd>{pendingImport.backup.entries.length} 笔已确认账目</dd>
              <dt>费用总额</dt>
              <dd>{backupTotal ? formatFen(String(backupTotal)) : "未记录"}</dd>
            </dl>
            {backupSourceWarnings.length > 0 && (
              <p className="notice notice--warn">
                来源序号第 {backupSourceWarnings.join("、")} 份在多笔账目中出现，导入后请逐笔核对，避免重复计入。
              </p>
            )}
            {entries.length > 0 && (
              <p className="notice">
                当前账本有 {entries.length} 笔账目。导入会新开一份整理，不会与当前账目合并，也不会覆盖后再相加。建议先导出当前账本。
              </p>
            )}
            <div className="btn-row">
              <button type="button" className="btn btn--primary" onClick={confirmImport}>
                新开一份并导入
              </button>
              {entries.length > 0 && (
                <button type="button" className="btn btn--ghost" onClick={exportBackup}>
                  先导出当前账本
                </button>
              )}
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setPendingImport(null)}
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="callout">
          <p className="callout__title">备份与恢复</p>
          <p>
            备份只含已确认的费用、日期、类别、来源序号和核对状态，不含原件、原始文件名、OCR 全文或身份信息。备份包含家庭费用，请妥善保存；恢复的账目显示「原件未关联」，提交前重新选取原件。
          </p>
        </div>

        <p className="meta-line">
          CSV 与打印清单只含已确认账目，不含姓名、证件号、联系方式和报告正文。
        </p>
      </section>

      <div className="btn-row">
        <Link className="btn btn--ghost" to="/receipts">
          继续核对其他票据
        </Link>
        <Link className="btn btn--ghost" to="/prepare">
          去小鹿灯提交准备
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
