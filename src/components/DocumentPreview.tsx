import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdf, renderPdfPage } from "../document/pdf";
import {
  safeDownloadName,
  type LocalDocument,
} from "../domain/documents";

type DocumentPreviewProps = {
  doc: LocalDocument;
  index: number;
  initialPage?: number;
  onClose: () => void;
};

export function DocumentPreview({ doc, index, initialPage, onClose }: DocumentPreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [page, setPage] = useState(Math.max(1, initialPage ?? 1));
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const isPdf = doc.previewKind === "pdf";
  const pageCount = pdf?.numPages ?? doc.pageCount ?? 1;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (!isPdf) return;
    let cancelled = false;
    let close: (() => Promise<void>) | null = null;
    openPdf(doc.file)
      .then((opened) => {
        if (cancelled) {
          void opened.close();
          return;
        }
        close = opened.close;
        setPdf(opened.document);
      })
      .catch(() => {
        if (!cancelled) setPdfError("这份 PDF 无法在当前浏览器预览，请下载原件查看。");
      });
    return () => {
      cancelled = true;
      setPdf(null);
      if (close) void close();
    };
  }, [doc.file, isPdf]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    const target = Math.min(Math.max(1, page), pdf.numPages);
    let cancelled = false;
    renderPdfPage(pdf, target, canvasRef.current, 1.4).catch(() => {
      if (!cancelled) setPdfError("无法绘制这一页，请下载原件查看。");
    });
    return () => {
      cancelled = true;
    };
  }, [pdf, page]);

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
    <dialog
      ref={dialogRef}
      className="preview-dialog"
      aria-label={`预览 ${doc.archiveType}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="preview-shell">
        <header className="preview-head">
          <div>
            <p className="eyebrow">原件预览</p>
            <h2 className="preview-title">{doc.archiveType} · 第 {index + 1} 份</h2>
            <p className="meta-line">
              {doc.fileName} · {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : ""}
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => dialogRef.current?.close()}>
            关闭
          </button>
        </header>

        <div className="preview-toolbar" role="group" aria-label="原件查看工具">
          {isPdf && (
            <>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
              >
                上一页
              </button>
              <span className="tag tag--muted" aria-live="polite">
                第 {Math.min(page, pageCount)} / {pageCount} 页
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                disabled={page >= pageCount}
              >
                下一页
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.25).toFixed(2))))}
            aria-label="缩小原件"
          >
            缩小
          </button>
          <span className="tag tag--muted">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
            aria-label="放大原件"
          >
            放大
          </button>
          {doc.previewKind === "image" && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setRotation((value) => (value + 90) % 360)}
            >
              旋转
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--small" onClick={download}>
            下载原件
          </button>
        </div>

        <div className="preview-stage">
          {doc.previewKind === "image" && doc.previewUrl && (
            <img
              src={doc.previewUrl}
              alt={`${doc.archiveType}原件`}
              className="preview-image"
              style={{ width: `${zoom * 100}%`, transform: `rotate(${rotation}deg)` }}
            />
          )}
          {isPdf && (
            <>
              {pdfError ? (
                <p className="notice notice--warn" role="alert">{pdfError}</p>
              ) : (
                <canvas ref={canvasRef} className="preview-canvas" style={{ width: `${zoom * 100}%` }} />
              )}
            </>
          )}
          {doc.previewKind === "none" && (
            <div className="preview-fallback">
              <p className="notice notice--warn">
                当前浏览器不能预览这种格式（如 OFD、HEIC 或受保护的 PDF）。原件已保留，可下载后查看。识别请手工填写，或换一份 JPG、PNG、PDF 副本。
              </p>
              <button type="button" className="btn btn--primary" onClick={download}>
                下载原件
              </button>
            </div>
          )}
        </div>

        <p className="preview-foot">
          原件按原始字节保存，旋转、放大只影响这里的显示。页面关闭后本批文件仍保留在当前浏览器会话中。
        </p>
      </div>
    </dialog>
  );
}
