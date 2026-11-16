import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentCard } from "@/src/components/DocumentCard";
import { DocumentPreview } from "@/src/components/DocumentPreview";
import { PageHeader } from "@/src/components/PageHeader";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";
import type { LocalDocument } from "@/src/domain/documents";
import { usePageTitle } from "@/src/lib/usePageTitle";

const statusExamples = [
  {
    tag: "相同文件",
    text: "同一张照片或同一份 PDF 被重复选中时，用 SHA-256 判断为同一文件，不自动删除。",
  },
  {
    tag: "疑似同一张票",
    text: "同一机构下票号相同时提示，由家长对照原件决定保留哪一份。",
  },
  {
    tag: "同日同金额",
    text: "开票日期和金额都相同只作对照提示，不做合并结论。",
  },
  {
    tag: "费用发生时间待核对",
    text: "只读到开票日期、日期不完整或日期冲突时，不直接判断是否在专项窗口内。",
  },
  {
    tag: "超出公告时间段",
    text: "按家长确认的费用发生日期核对 2026-04-01 至 2026-12-31，原件仍会保留。",
  },
];

const waitingStates = ["待识别", "已取消", "识别失败"];

export default function ReceiptsPage() {
  usePageTitle("票据导入与核对");
  const { isDemo, modeLabel, demoStatus } = useWorkspace();
  const {
    docs,
    flags,
    isRunning,
    runningId,
    addFiles,
    clearAll,
    startRecognition,
    cancelRecognition,
  } = useDocuments();
  const [preview, setPreview] = useState<{ id: string; page?: number } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const [addedMessage, setAddedMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const counts = useMemo(() => {
    const confirmed = docs.filter((doc) => doc.confirmed).length;
    const failed = docs.filter((doc) => doc.ocrState === "识别失败").length;
    const unsupported = docs.filter((doc) => doc.ocrState === "不支持").length;
    const flagged = docs.filter((doc) => (flags[doc.id] ?? []).length > 0).length;
    const runnable = docs.filter(
      (doc) => waitingStates.includes(doc.ocrState) && doc.ocrState !== "不支持",
    ).length;
    return { confirmed, failed, unsupported, flagged, runnable };
  }, [docs, flags]);

  const flaggedDocs = useMemo(
    () => docs.filter((doc) => (flags[doc.id] ?? []).length > 0),
    [docs, flags],
  );

  const previewDoc = preview ? docs.find((doc) => doc.id === preview.id) : undefined;
  const previewIndex = previewDoc ? docs.findIndex((doc) => doc.id === previewDoc.id) : 0;

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!fileList.length) return;
    setIsAdding(true);
    setRejected([]);
    setAddedMessage("");
    try {
      const result = await addFiles(fileList);
      setRejected(result.rejected);
      if (result.added) {
        setAddedMessage(`本次加入 ${result.added} 份原件，已开始本机识别。`);
      }
    } finally {
      setIsAdding(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scrollToDoc = (id: string) => {
    document.getElementById(`doc-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader
        eyebrow="家庭费用与票据夹 · 第一步"
        title="导入、看原件、逐张核对"
        lead="票据和证明材料只在当前浏览器会话里处理。识别用随站点发布的本地中英文语言包，用户文件不发送到任何识别服务。原件按原始字节保留，预览只使用副本。"
      />

      <p className="notice" role="note">
        当前为{modeLabel}，文件和账目只在本次页面会话中保留。离开页面前可下载原件或在账本页导出备份。每次最多 20 份，单份 20 MB，这是网站处理限制，不是受理机构的要求。
      </p>
      {isDemo && demoStatus === "ready" && (
        <p className="callout" role="note">
          演示票据已预填并标记为已核对，可以直接查看原件、修改字段，或在账本页核对三笔账目。所有样张均标注「演示用虚构数据」。
        </p>
      )}

      <section className="section" aria-labelledby="import-title">
        <div className="section__head">
          <h2 className="section__title" id="import-title">
            导入票据
          </h2>
          <p className="section__note">JPG、PNG、PDF 自动识别；OFD、HEIC 保留原件后手工填写</p>
        </div>

        <div
          className={`drop-zone${isDragging ? " drop-zone--active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <div>
            <p className="drop-zone__title">把发票、费用清单、结算单或证明材料拖到这里</p>
            <p className="meta-line">
              也可以逐个选择。医院发票、费用明细和结算单可以以后在账本里归到同一次就诊。
            </p>
          </div>
          <div className="btn-row">
            <label className={`btn btn--primary file-picker${isAdding ? " is-disabled" : ""}`}>
              {isAdding ? "正在读取原件…" : "选择文件"}
              <input
                ref={fileInputRef}
                type="file"
                className="file-picker__input"
                multiple
                disabled={isAdding}
                aria-label="选择票据文件"
                accept=".jpg,.jpeg,.png,.pdf,.ofd,.heic,.heif,image/jpeg,image/png,application/pdf"
                onChange={(event) => {
                  if (event.target.files) void handleFiles(event.target.files);
                }}
              />
            </label>
            {isRunning ? (
              <button type="button" className="btn btn--ghost" onClick={cancelRecognition}>
                取消识别
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => startRecognition()}
                disabled={counts.runnable === 0}
              >
                开始识别{counts.runnable ? `（${counts.runnable}）` : ""}
              </button>
            )}
            {docs.length > 0 &&
              (confirmClear ? (
                <span className="inline-confirm">
                  <span>清空后需要重新导入。</span>
                  <button
                    type="button"
                    className="btn btn--danger btn--small"
                    onClick={() => {
                      clearAll();
                      setConfirmClear(false);
                      setAddedMessage("");
                      setRejected([]);
                      setPreview(null);
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
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmClear(true)}>
                  清空本批
                </button>
              ))}
          </div>
          <p className="meta-line">
            第一次识别需要加载约 31 MB 的中英文语言包，加载后在本页内复用；期间可取消。识别失败的条目可重试或手工填写。
          </p>
        </div>

        {addedMessage && (
          <p className="callout" role="status">
            {addedMessage}
          </p>
        )}
        {rejected.length > 0 && (
          <div className="notice notice--warn" role="alert">
            <p>以下文件没有加入本批：</p>
            <ul className="plain-list">
              {rejected.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {docs.length > 0 && (
        <section className="section" aria-labelledby="batch-title">
          <div className="section__head">
            <h2 className="section__title" id="batch-title">
              本批 {docs.length} 份
            </h2>
            <p className="section__note" role="status">
              已核对 {counts.confirmed} 份 · 待核对 {docs.length - counts.confirmed} 份
              {counts.failed ? ` · 识别失败 ${counts.failed} 份` : ""}
              {counts.unsupported ? ` · 手工填写 ${counts.unsupported} 份` : ""}
              {counts.flagged ? ` · 有提示 ${counts.flagged} 份` : ""}
            </p>
          </div>

          {runningId && docs.some((doc) => doc.ocrState === "识别中") && (
            <p className="status-strip" role="status">
              正在逐份识别：第 {docs.findIndex((doc) => doc.id === runningId) + 1} 份。可随时取消，已完成的字段会保留。
            </p>
          )}

          {flaggedDocs.length > 0 && (
            <div className="issue-panel">
              <h3 className="subhead">先看这几张</h3>
              <p className="meta-line">这些只是提示，不会自动删除、合并或改变金额。</p>
              <ul className="issue-list">
                {flaggedDocs.map((doc) => {
                  const index = docs.findIndex((item) => item.id === doc.id);
                  return (
                    <li key={doc.id}>
                      <button type="button" className="link-button" onClick={() => scrollToDoc(doc.id)}>
                        第 {index + 1} 份 · {(flags[doc.id] ?? []).map((flag) => flag.label).join("、")}
                      </button>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setPreview({ id: doc.id })}
                      >
                        看原件
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="doc-list">
            {docs.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                index={index}
                flags={flags[doc.id] ?? []}
                onPreview={(target: LocalDocument, page?: number) =>
                  setPreview({ id: target.id, page })
                }
              />
            ))}
          </div>

          <p className="meta-line">
            红冲、退费、同一次住院的多份文件以及不确定的关联，都需要家长对照原件后手工处理。当前版本不自动删除任何文件，也不根据日期或金额自动合并。
          </p>
        </section>
      )}

      {docs.length === 0 && (
        <>
          <section className="section" aria-labelledby="flow-title">
            <div className="section__head">
              <h2 className="section__title" id="flow-title">
                导入后会发生什么
              </h2>
              <p className="section__note">先原件、后字段，识别结果都可以改</p>
            </div>
            <ol className="flow">
              <li>
                <b>保存原件</b>
                <span>每份文件按原始字节保留，计算 SHA-256，用来发现完全相同的重复选择。</span>
              </li>
              <li>
                <b>本机识别</b>
                <span>PDF 先读文字层；扫描件和图片在本地 Worker 里识别中文和英文，不发送用户票据。</span>
              </li>
              <li>
                <b>逐张核对</b>
                <span>票号、机构、开票日期、费用发生日期、项目原文和金额，都能回到原件页码查看。</span>
              </li>
              <li>
                <b>家长确认</b>
                <span>只有家长点过“我已核对这些字段”的条目，才算本批已核对。</span>
              </li>
            </ol>
          </section>

          <section className="section" aria-labelledby="status-title">
            <div className="section__head">
              <h2 className="section__title" id="status-title">
                会遇到的状态
              </h2>
            </div>
            <ul className="steps-later">
              {statusExamples.map((item) => (
                <li key={item.tag}>
                  <div>
                    <b>{item.tag}</b>
                    <span>{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className="callout" id="demo">
        <p className="callout__title">关于示例票据</p>
        <p>
          示例票据会包含同一次住院发票与结算单、外购药和基因检测票据、重复照片和日期不明的票据，全部标注「演示用虚构数据」，并与真实资料分开存放。示例样张与账本将在后续步骤接入。
        </p>
      </div>

      <div className="btn-row">
        <Link className="btn btn--ghost" to="/learn">
          先看票据字段怎么区分
        </Link>
        <Link className="btn btn--ghost" to="/prepare">
          去提交准备页
        </Link>
      </div>

      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          index={previewIndex}
          initialPage={preview?.page}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
