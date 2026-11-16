import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { DocumentError } from "./errors";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const baseOptions = {
  isEvalSupported: false,
  useSystemFonts: true,
} as const;

export type PdfPageText = { page: number; text: string };
export type PdfTextResult = { pageCount: number; pages: PdfPageText[]; totalChars: number };

function wrapError(error: unknown): DocumentError {
  if (error instanceof DocumentError) return error;
  const name = (error as { name?: string } | null)?.name;
  if (name === "PasswordException") {
    return new DocumentError("password", "这份 PDF 需要密码，暂时无法读取文字。请保留原件并手工填写。");
  }
  if (name === "InvalidPDFException") {
    return new DocumentError("pdf", "这份 PDF 无法解析，可能已损坏或格式不受支持。请保留原件并手工填写。");
  }
  return new DocumentError("pdf", "读取 PDF 时出错，请保留原件并手工填写。");
}

async function loadPdf(file: File): Promise<{ document: PDFDocumentProxy; close: () => Promise<void> }> {
  let task: pdfjsLib.PDFDocumentLoadingTask | undefined;
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    task = pdfjsLib.getDocument({ ...baseOptions, data });
    const document = await task.promise;
    return {
      document,
      close: async () => {
        try {
          await task?.destroy();
        } catch {
          // 已销毁或工作线程已退出，无需再次清理。
        }
      },
    };
  } catch (error) {
    try {
      await task?.destroy();
    } catch {
      // 忽略清理失败，保留原始错误信息。
    }
    throw wrapError(error);
  }
}

async function pageText(page: PDFPageProxy): Promise<string> {
  const content = await page.getTextContent();
  let text = "";
  content.items.forEach((item) => {
    if (!("str" in item)) return;
    text += item.str;
    if (item.hasEOL) text += "\n";
  });
  return text;
}

export async function readPdfText(file: File): Promise<PdfTextResult> {
  const { document: pdf, close } = await loadPdf(file);
  try {
    const pages: PdfPageText[] = [];
    let totalChars = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const text = await pageText(page);
      totalChars += text.replace(/\s/g, "").length;
      pages.push({ page: pageNumber, text });
      page.cleanup();
    }
    return { pageCount: pdf.numPages, pages, totalChars };
  } catch (error) {
    throw wrapError(error);
  } finally {
    await close();
  }
}

export async function openPdf(file: File) {
  return loadPdf(file);
}

export function renderPdfPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  return pdf.getPage(pageNumber).then(async (page) => {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext("2d");
    if (!context) throw new DocumentError("pdf", "当前浏览器无法绘制 PDF 页面。");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    await page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
    }).promise;
    page.cleanup();
  });
}

export async function renderPdfPageToBlob(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 2,
): Promise<Blob> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new DocumentError("pdf", "当前浏览器无法绘制 PDF 页面。");
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  page.cleanup();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new DocumentError("pdf", "无法把 PDF 页面转成图片用于识别。");
  return blob;
}
