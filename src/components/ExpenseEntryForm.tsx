import { useEffect, useMemo, useRef, useState } from "react";
import {
  amountKeys,
  amountLabels,
  amountStatuses,
  createEmptyAid,
  createEmptyAmounts,
  commonExpenseDate,
  expenseCategories,
  faceAmountKeys,
  inferCategoryFromDocs,
  nearMatchReasons,
  primaryAmountKeys,
  type AmountKey,
  type AmountRecord,
  type AmountStatus,
  type ExpenseEntry,
} from "@/src/domain/ledger";
import {
  fenToYuanInput,
  formatFen,
  isValidIsoDate,
  yuanInputToFen,
  type LocalDocument,
} from "@/src/domain/documents";

type SaveResult = { ok: boolean; error?: string };

type ExpenseEntryFormProps = {
  heading: string;
  intro: string;
  docs: LocalDocument[];
  usedDocumentIds: Set<string>;
  initial?: ExpenseEntry;
  preselectedIds?: string[];
  onSave: (entry: ExpenseEntry) => SaveResult;
  onCancel: () => void;
};

function cloneEntry(entry: ExpenseEntry): ExpenseEntry {
  return {
    ...entry,
    documentIds: [...entry.documentIds],
    sourceIndexes: [...entry.sourceIndexes],
    amounts: Object.fromEntries(
      amountKeys.map((key) => [key, { ...entry.amounts[key] }]),
    ) as Record<AmountKey, AmountRecord>,
    aid: { ...entry.aid },
  };
}

function buildDraft(
  initial: ExpenseEntry | undefined,
  preselectedIds: string[],
  docs: LocalDocument[],
): ExpenseEntry {
  if (initial) {
    return { ...cloneEntry(initial), confirmed: false };
  }
  const selected = docs.filter((doc) => preselectedIds.includes(doc.id));
  const common = commonExpenseDate(selected);
  return {
    id: crypto.randomUUID(),
    title: "",
    category: inferCategoryFromDocs(selected),
    expenseDate: common,
    dateStatus: common ? "已确认" : "待核对",
    documentIds: selected.map((doc) => doc.id),
    sourceIndexes: selected
      .map((doc) => docs.findIndex((item) => item.id === doc.id) + 1)
      .filter((index) => index > 0),
    amounts: createEmptyAmounts(),
    aid: createEmptyAid(),
    note: "",
    confirmed: false,
  };
}

type AmountFieldProps = {
  id: string;
  label: string;
  record: AmountRecord;
  onChange: (record: AmountRecord) => void;
  onInvalidChange: (invalid: boolean) => void;
};

function AmountField({ id, label, record, onChange, onInvalidChange }: AmountFieldProps) {
  const [text, setText] = useState(() => fenToYuanInput(record.value));
  const [error, setError] = useState("");
  const lastRecordRef = useRef(record.value);

  useEffect(() => {
    if (record.value === lastRecordRef.current) return;
    lastRecordRef.current = record.value;
    const parsed = yuanInputToFen(text);
    if (parsed === record.value) return;
    setText(fenToYuanInput(record.value));
  }, [record.value, text]);

  const reportInvalid = (invalid: boolean) => onInvalidChange(invalid);

  const handleText = (value: string) => {
    setText(value);
    if (!value.trim()) {
      reportInvalid(false);
      setError("");
      onChange({ value: "", status: "未记录" });
      return;
    }
    const fen = yuanInputToFen(value);
    if (fen === undefined) {
      reportInvalid(true);
      setError("请按 1234.56 的格式填写，单位是元。");
      return;
    }
    reportInvalid(false);
    setError("");
    onChange({
      value: fen,
      status: record.status === "未记录" ? "家长核对" : record.status,
    });
  };

  const handleStatus = (status: AmountStatus) => {
    if (status === "未记录") {
      setText("");
      setError("");
      reportInvalid(false);
      onChange({ value: "", status });
      return;
    }
    if (record.value === "") {
      setError("先填写金额，再标明来源。");
      return;
    }
    setError("");
    onChange({ ...record, status });
  };

  return (
    <div className="amount-field">
      <label className="amount-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="amount-field__controls">
        <div className="amount-input">
          <span aria-hidden="true">¥</span>
          <input
            id={id}
            className="input"
            inputMode="decimal"
            value={text}
            placeholder="未记录"
            aria-invalid={Boolean(error)}
            onChange={(event) => handleText(event.target.value)}
            onBlur={() => {
              if (!error && text.trim()) {
                const fen = yuanInputToFen(text);
                setText(fen ? fenToYuanInput(fen) : "");
              }
            }}
          />
        </div>
        <select
          className="select amount-field__status"
          value={record.status}
          aria-label={`${label} 的来源状态`}
          disabled={record.value === "" && record.status === "未记录"}
          onChange={(event) => handleStatus(event.target.value as AmountStatus)}
        >
          {amountStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function ExpenseEntryForm({
  heading,
  intro,
  docs,
  usedDocumentIds,
  initial,
  preselectedIds = [],
  onSave,
  onCancel,
}: ExpenseEntryFormProps) {
  const [draft, setDraft] = useState<ExpenseEntry>(() =>
    buildDraft(initial, preselectedIds, docs),
  );
  const [formError, setFormError] = useState("");
  const [aidInvalid, setAidInvalid] = useState(false);
  const [aidText, setAidText] = useState(() => fenToYuanInput(initial?.aid.value ?? ""));
  const invalidRef = useRef<Set<AmountKey>>(new Set());
  const formId = useMemo(() => `entry-${draft.id}`, [draft.id]);

  const selectableDocs = useMemo(
    () =>
      docs
        .map((doc, index) => ({ doc, index }))
        .filter(({ doc }) => doc.confirmed)
        .filter(
          ({ doc }) =>
            draft.documentIds.includes(doc.id) || !usedDocumentIds.has(doc.id),
        ),
    [docs, draft.documentIds, usedDocumentIds],
  );
  const hiddenConfirmed = docs.filter(
    (doc) => doc.confirmed && usedDocumentIds.has(doc.id) && !draft.documentIds.includes(doc.id),
  ).length;

  const setAmount = (key: AmountKey, record: AmountRecord) => {
    setDraft((previous) => ({
      ...previous,
      amounts: { ...previous.amounts, [key]: record },
    }));
  };

  const toggleDocument = (docId: string) => {
    setDraft((previous) => {
      const selected = previous.documentIds.includes(docId);
      const nextIds = selected
        ? previous.documentIds.filter((id) => id !== docId)
        : [...previous.documentIds, docId];
      const nextIndexes = nextIds.length
        ? nextIds
            .map((id) => docs.findIndex((doc) => doc.id === id) + 1)
            .filter((index) => index > 0)
            .sort((a, b) => a - b)
        : previous.sourceIndexes;
      return { ...previous, documentIds: nextIds, sourceIndexes: nextIndexes };
    });
  };

  const handleAidText = (value: string) => {
    setAidText(value);
    if (!value.trim()) {
      setAidInvalid(false);
      setDraft((previous) => ({
        ...previous,
        aid: { ...previous.aid, value: "", status: "未记录" },
      }));
      return;
    }
    const fen = yuanInputToFen(value);
    if (fen === undefined) {
      setAidInvalid(true);
      return;
    }
    setAidInvalid(false);
    setDraft((previous) => ({
      ...previous,
      aid: {
        ...previous.aid,
        value: fen,
        status: "已到账",
      },
    }));
  };

  const handleSave = () => {
    setFormError("");
    if (invalidRef.current.size > 0) {
      setFormError("还有金额格式不正确，请先修改或清空。");
      return;
    }
    if (aidInvalid) {
      setFormError("公益救助金额格式不正确，请修改或清空。");
      return;
    }
    if (draft.expenseDate && !isValidIsoDate(draft.expenseDate)) {
      setFormError("费用发生日期请使用 YYYY-MM-DD。");
      return;
    }
    if (draft.dateStatus === "已确认" && !isValidIsoDate(draft.expenseDate)) {
      setFormError("日期已勾选确认，请填写费用发生日期；无法确认时改选「日期待核对」。");
      return;
    }
    if (draft.aid.status === "已到账" && draft.aid.value === "") {
      setFormError("已标记救助到账，请填写金额；未到账请取消「已到账」。");
      return;
    }
    const next: ExpenseEntry = {
      ...draft,
      title: draft.title.trim(),
      note: draft.note.trim(),
      aid: { ...draft.aid, note: draft.aid.note.trim() },
    };
    const result = onSave(next);
    if (!result.ok) {
      setFormError(result.error ?? "保存没有完成，请检查后重试。");
    }
  };

  return (
    <section className="entry-form" aria-labelledby={`${formId}-heading`}>
      <div className="entry-form__head">
        <h3 className="entry-form__title" id={`${formId}-heading`}>
          {heading}
        </h3>
        <p className="meta-line">{intro}</p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field__label">账目标题（可选）</span>
          <input
            className="input"
            maxLength={80}
            value={draft.title}
            placeholder="例如：5 月住院、2026-06 外购药"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">类别</span>
          <select
            className="select"
            value={draft.category}
            onChange={(event) =>
              setDraft({ ...draft, category: event.target.value as ExpenseEntry["category"] })
            }
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <label className="field__label" htmlFor={`${formId}-date`}>
            费用发生日期
          </label>
          <input
            id={`${formId}-date`}
            className="input"
            type="date"
            value={draft.expenseDate}
            onChange={(event) =>
              setDraft({ ...draft, expenseDate: event.target.value.slice(0, 10) })
            }
          />
          <span className="field__hint">
            按收费或服务实际发生的日期填写；开票日期不能代替。
          </span>
          <label className="check-row">
            <input
              type="checkbox"
              checked={draft.dateStatus === "待核对"}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  dateStatus: event.target.checked ? "待核对" : "已确认",
                })
              }
            />
            <span>费用发生日期待核对</span>
          </label>
        </div>
      </div>

      <div className="entry-form__block">
        <h4 className="subhead">关联原件</h4>
        <p className="meta-line">
          只列出家长已核对的原件。同一份原件只能归入一笔账目；关联不明时先不选，保留待核对。
        </p>
        {selectableDocs.length ? (
          <ul className="source-options">
            {selectableDocs.map(({ doc, index }) => {
              const reasons =
                draft.documentIds.length > 0 && !draft.documentIds.includes(doc.id)
                  ? nearMatchReasons(draft, doc)
                  : [];
              return (
                <li key={doc.id}>
                  <label className="source-option">
                    <input
                      type="checkbox"
                      checked={draft.documentIds.includes(doc.id)}
                      onChange={() => toggleDocument(doc.id)}
                    />
                    <span className="source-option__body">
                      <span className="source-option__title">
                        第 {index + 1} 份 · {doc.archiveType}
                      </span>
                      <span className="meta-line">
                        费用日期 {doc.fields.expenseDate.value || "待核对"} · 金额{" "}
                        {formatFen(doc.fields.amountFen.value)}
                      </span>
                      {reasons.length > 0 && (
                        <span className="tag tag--warm">{reasons.join("、")}，请核对归属</span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="notice">
            还没有可关联的已核对原件。可以先保存账目，之后在票据页核对后再回来关联。
          </p>
        )}
        {hiddenConfirmed > 0 && (
          <p className="meta-line">另有 {hiddenConfirmed} 份已核对原件已归入其他账目，未列出。</p>
        )}
        {draft.documentIds.length === 0 && draft.sourceIndexes.length > 0 && (
          <p className="notice">
            这笔账目来自账本备份，保存的来源序号为第 {draft.sourceIndexes.join("、")} 份。原票据未随备份恢复，可在这里重新关联。
          </p>
        )}
      </div>

      <div className="entry-form__block">
        <h4 className="subhead">费用与支付（元）</h4>
        <p className="meta-line">
          只有原件明确列出，或家长对照凭证后补录，才填写金额。没有的项目保持「未记录」，不补零。
        </p>
        <div className="amount-grid">
          {primaryAmountKeys.map((key) => (
            <AmountField
              key={key}
              id={`${formId}-${key}`}
              label={amountLabels[key]}
              record={draft.amounts[key]}
              onChange={(record) => setAmount(key, record)}
              onInvalidChange={(invalid) => {
                if (invalid) invalidRef.current.add(key);
                else invalidRef.current.delete(key);
              }}
            />
          ))}
        </div>
        <h4 className="subhead">票面原标签（元）</h4>
        <p className="meta-line">
          「个人自付」「个人自费」「其他支付」保留票面原标签，各自记录，不与其他支付项目相加推算。
        </p>
        <div className="amount-grid">
          {faceAmountKeys.map((key) => (
            <AmountField
              key={key}
              id={`${formId}-${key}`}
              label={amountLabels[key]}
              record={draft.amounts[key]}
              onChange={(record) => setAmount(key, record)}
              onInvalidChange={(invalid) => {
                if (invalid) invalidRef.current.add(key);
                else invalidRef.current.delete(key);
              }}
            />
          ))}
        </div>
      </div>

      <div className="entry-form__block">
        <h4 className="subhead">公益救助（可选）</h4>
        <p className="meta-line">
          只记录已经实际到账的金额，单独展示，不用于推算费用或支付。没有到账记录时保持「未记录」。
        </p>
        <div className="aid-row">
          <div className="amount-input">
            <span aria-hidden="true">¥</span>
            <input
              className="input"
              inputMode="decimal"
              value={aidText}
              placeholder="未记录"
              aria-label="已到账公益救助金额（元）"
              aria-invalid={aidInvalid}
              onChange={(event) => handleAidText(event.target.value)}
              onBlur={() => {
                if (!aidInvalid && aidText.trim()) {
                  const fen = yuanInputToFen(aidText);
                  setAidText(fen ? fenToYuanInput(fen) : "");
                }
              }}
            />
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={draft.aid.status === "已到账"}
              onChange={(event) => {
                if (event.target.checked) {
                  setDraft((previous) => ({
                    ...previous,
                    aid: { ...previous.aid, status: "已到账" },
                  }));
                } else {
                  setAidText("");
                  setAidInvalid(false);
                  setDraft((previous) => ({
                    ...previous,
                    aid: { ...previous.aid, value: "", status: "未记录" },
                  }));
                }
              }}
            />
            <span>已到账</span>
          </label>
        </div>
        {aidInvalid && (
          <span className="field-error" role="alert">
            请按 1234.56 的格式填写救助金额。
          </span>
        )}
        <label className="field" style={{ marginTop: 10 }}>
          <span className="field__label">救助来源或到账说明（可选）</span>
          <input
            className="input"
            maxLength={200}
            value={draft.aid.note}
            placeholder="例如：公益项目名称、到账月份；不要填写证件号"
            onChange={(event) =>
              setDraft({ ...draft, aid: { ...draft.aid, note: event.target.value } })
            }
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">备注（可选）</span>
        <textarea
          className="input entry-form__note"
          maxLength={500}
          rows={3}
          value={draft.note}
          placeholder="例如：同一次住院的三份文件、退费待核对。不要填写姓名、证件号或联系方式。"
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
        />
      </label>

      <label className="check-row entry-form__confirm">
        <input
          type="checkbox"
          checked={draft.confirmed}
          onChange={(event) => setDraft({ ...draft, confirmed: event.target.checked })}
        />
        <span>我已核对这些金额和日期，保存后计入统计</span>
      </label>

      {formError && (
        <p className="notice notice--warn" role="alert">
          {formError}
        </p>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          {initial ? "保存修改" : "保存账目"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          取消
        </button>
      </div>
      <p className="meta-line">
        修改已计入的账目后，需要重新勾选「我已核对这些金额和日期」才会再次进入统计。
      </p>
    </section>
  );
}
