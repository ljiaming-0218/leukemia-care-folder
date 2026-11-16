import { useEffect, useState } from "react";
import { useDocuments } from "../features/documents/DocumentsContext";
import {
  archiveTypes,
  fenToYuanInput,
  fieldKeys,
  fieldLabels,
  formatBytes,
  safeDownloadName,
  windowStatus,
  yuanInputToFen,
  type DocFlag,
  type LocalDocument,
} from "../domain/documents";
import { xiaoludengRule } from "../data/policies/xiaoludeng";

type DocumentCardProps = {
  doc: LocalDocument;
  index: number;
  flags: DocFlag[];
  onPreview: (doc: LocalDocument, page?: number) => void;
};

function stateTag(doc: LocalDocument): { label: string; tone: string } {
  switch (doc.ocrState) {
    case "识别中":
      return { label: "识别中", tone: "accent" };
    case "已识别":
      return doc.confirmed
        ? { label: "已识别", tone: "ok" }
        : { label: "已识别，待核对", tone: "warm" };
    case "识别失败":
      return { label: "识别失败", tone: "danger" };
    case "已取消":
      return { label: "已取消", tone: "muted" };
    case "不支持":
      return { label: "不支持自动识别", tone: "muted" };
    default:
      return { label: "待识别", tone: "muted" };
  }
}

export function DocumentCard({ doc, index, flags, onPreview }: DocumentCardProps) {
  const { updateArchiveType, updateField, setConfirmed, dismissFlag, removeDoc, startRecognition, isRunning } =
    useDocuments();
  const [amountText, setAmountText] = useState(() => fenToYuanInput(doc.fields.amountFen.value));
  const [amountError, setAmountError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const status = stateTag(doc);
  const window = windowStatus(doc, xiaoludengRule.expenseFrom, xiaoludengRule.expenseTo);
  const canRerun = doc.ocrState !== "不支持";

  useEffect(() => {
    setAmountText(fenToYuanInput(doc.fields.amountFen.value));
  }, [doc.fields.amountFen.value]);

  const commitAmount = (text: string) => {
    const fen = yuanInputToFen(text);
    if (fen === undefined) {
      setAmountError("请按 1234.56 的格式填写，金额单位是元。");
      return;
    }
    setAmountError("");
    setAmountText(fen ? fenToYuanInput(fen) : "");
    if (fen !== doc.fields.amountFen.value) updateField(doc.id, "amountFen", fen);
  };

  const download = () => {
    const url = URL.createObjectURL(doc.file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = safeDownloadName(doc, index);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="doc-card" id={`doc-${doc.id}`}>
      <header className="doc-card__head">
        <button
          type="button"
          className="doc-thumb"
          onClick={() => onPreview(doc)}
          aria-label={`预览第 ${index + 1} 份原件`}
        >
          {doc.previewKind === "image" && doc.previewUrl ? (
            <img src={doc.previewUrl} alt="" />
          ) : (
            <span className="doc-thumb__label">
              {doc.previewKind === "pdf" ? "PDF" : "原件"}
            </span>
          )}
        </button>
        <div className="doc-card__identity">
          <p className="doc-card__seq">第 {index + 1} 份</p>
          <h3 className="doc-card__title">{doc.fileName}</h3>
          <p className="meta-line">
            {formatBytes(doc.size)} · SHA-256 {doc.hash.slice(0, 12)}…
          </p>
          <div className="tag-row">
            <span className={`tag tag--${status.tone}`}>{status.label}</span>
            <span className={`tag tag--${window.tone}`}>{window.label}</span>
            {doc.confirmed && <span className="tag tag--ok">家长已核对</span>}
          </div>
        </div>
        <label className="field doc-card__archive">
          <span>归档到</span>
          <select
            className="select"
            value={doc.archiveType}
            onChange={(event) => updateArchiveType(doc.id, event.target.value as never)}
          >
            {archiveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </header>

      {doc.ocrState === "识别中" && (
        <div className="doc-progress">
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(doc.progress * 100)} aria-label={`第 ${index + 1} 份识别进度`}>
            <div className="progress-bar" style={{ width: `${Math.max(3, doc.progress * 100)}%` }} />
          </div>
          <p className="meta-line">
            {doc.progressLabel || "准备中"} · {Math.round(doc.progress * 100)}%
          </p>
        </div>
      )}

      {doc.error && (
        <p className="notice notice--warn" role="alert">
          {doc.error}
        </p>
      )}
      {doc.ocrNote && <p className="meta-line doc-note">{doc.ocrNote}</p>}

      {flags.length > 0 && (
        <ul className="flag-list">
          {flags.map((flag) => (
            <li key={flag.key} className="flag">
              <div>
                <strong>{flag.label}</strong>
                <span>{flag.detail}</span>
              </div>
              {flag.dismissible && (
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => dismissFlag(doc.id, flag.key)}
                >
                  已对照，保留两份
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="doc-fields">
        {fieldKeys.map((key) => {
          const field = doc.fields[key];
          const isAmount = key === "amountFen";
          return (
            <div className="field doc-field" key={key}>
              <span className="doc-field__label">
                <span>{fieldLabels[key]}</span>
                <span className={`tag tag--${field.value ? (doc.confirmed ? "ok" : "warm") : "muted"}`}>
                  {field.value ? (doc.confirmed ? "已确认" : "待核对") : "待填写"}
                </span>
              </span>
              {isAmount ? (
                <>
                  <div className="amount-input">
                    <span aria-hidden="true">¥</span>
                    <input
                      className="input"
                      inputMode="decimal"
                      value={amountText}
                      placeholder="按票面填写，例如 1234.56"
                      aria-label={`第 ${index + 1} 份的金额（元）`}
                      aria-invalid={Boolean(amountError)}
                      onChange={(event) => {
                        setAmountText(event.target.value);
                        setAmountError("");
                      }}
                      onBlur={(event) => commitAmount(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") commitAmount(event.currentTarget.value);
                      }}
                    />
                  </div>
                  {amountError && <span className="field-error" role="alert">{amountError}</span>}
                </>
              ) : (
                <input
                  className="input"
                  value={field.value}
                  placeholder={
                    key === "expenseDate" || key === "invoiceDate" ? "YYYY-MM-DD" : "未识别，可手工填写"
                  }
                  aria-label={`第 ${index + 1} 份的${fieldLabels[key]}`}
                  onChange={(event) => updateField(doc.id, key, event.target.value)}
                />
              )}
              <span className="doc-field__foot">
                {field.origin === "识别" && <span className="tag tag--muted">识别结果</span>}
                {field.origin === "家长填写" && <span className="tag tag--muted">家长填写</span>}
                {field.page !== undefined && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onPreview(doc, field.page)}
                  >
                    看第 {field.page} 页原件
                  </button>
                )}
              </span>
              {field.snippet && (
                <span className="doc-field__snippet" title={field.snippet}>
                  识别依据：{field.snippet}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="doc-actions">
        <button
          type="button"
          className="btn btn--primary btn--small"
          onClick={() => setConfirmed(doc.id, !doc.confirmed)}
        >
          {doc.confirmed ? "取消“已核对”" : "我已核对这些字段"}
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => onPreview(doc)}>
          查看原件
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={download}>
          下载原件
        </button>
        {canRerun && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => startRecognition([doc.id])}
            disabled={isRunning}
          >
            重新识别
          </button>
        )}
        {confirmRemove ? (
          <span className="inline-confirm">
            <span>移除后需重新导入原件。</span>
            <button type="button" className="btn btn--danger btn--small" onClick={() => removeDoc(doc.id)}>
              确认移除
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmRemove(false)}>
              取消
            </button>
          </span>
        ) : (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmRemove(true)}>
            移除
          </button>
        )}
      </div>
      <p className="doc-card__foot">
        费用发生日期用于核对专项公告时间，开票日期单独保存；两者不互相代替。修改任一字段后需要重新核对。
      </p>
    </article>
  );
}
