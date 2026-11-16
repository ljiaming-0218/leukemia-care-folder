import { DocumentError } from "./errors";
import { cancelOcr, recognizeImage } from "./ocr";
import { openPdf, readPdfText, renderPdfPageToBlob } from "./pdf";
import type { SourcePage } from "./parse";

export type ExtractResult = {
  pages: SourcePage[];
  pageCount: number;
  note?: string;
};

export type ExtractProgress = (progress: number, label: string) => void;

const MAX_OCR_PAGES = 5;
const TEXT_LAYER_MIN_CHARS = 30;
const MAX_IMAGE_EDGE = 2400;

export function canRecognize(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    /\.(pdf|jpe?g|png)$/i.test(file.name)
  );
}

async function downscaleImage(blob: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_IMAGE_EDGE) {
      bitmap.close();
      return blob;
    }
    const ratio = MAX_IMAGE_EDGE / longest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return blob;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const scaled = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    canvas.width = 0;
    canvas.height = 0;
    return scaled ?? blob;
  } catch {
    return blob;
  }
}

async function extractImage(file: File, onProgress?: ExtractProgress): Promise<ExtractResult> {
  const image = await downscaleImage(file);
  const text = await recognizeImage(image, (progress, status) =>
    onProgress?.(0.08 + progress * 0.92, status),
  );
  return {
    pages: [{ page: 1, text }],
    pageCount: 1,
  };
}

async function extractPdf(
  file: File,
  signal: AbortSignal | undefined,
  onProgress?: ExtractProgress,
): Promise<ExtractResult> {
  onProgress?.(0.04, "读取 PDF 文字层");
  const textLayer = await readPdfText(file);
  if (signal?.aborted) throw new DocumentError("cancelled", "已取消识别。");
  if (textLayer.totalChars >= TEXT_LAYER_MIN_CHARS) {
    onProgress?.(1, "已读取文字层");
    return {
      pages: textLayer.pages,
      pageCount: textLayer.pageCount,
    };
  }

  const pageTotal = Math.min(textLayer.pageCount, MAX_OCR_PAGES);
  const opened = await openPdf(file);
  try {
    const pages: SourcePage[] = [];
    for (let index = 0; index < pageTotal; index += 1) {
      if (signal?.aborted) throw new DocumentError("cancelled", "已取消识别。");
      const pageNumber = index + 1;
      const base = 0.08 + (index / pageTotal) * 0.9;
      onProgress?.(base, `第 ${pageNumber} 页 · 转为图片`);
      const image = await renderPdfPageToBlob(opened.document, pageNumber, 2);
      const text = await recognizeImage(image, (progress, status) =>
        onProgress?.(
          base + (progress * 0.9) / pageTotal,
          `第 ${pageNumber} 页 · ${status}`,
        ),
      );
      pages.push({ page: pageNumber, text });
    }
    const note =
      textLayer.pageCount > pageTotal
        ? `扫描件仅识别了前 ${pageTotal} 页，其余页请在原件中查看并手工补充。`
        : undefined;
    onProgress?.(1, "识别完成");
    return { pages, pageCount: textLayer.pageCount, note };
  } finally {
    await opened.close();
  }
}

export async function extractDocument(
  file: File,
  signal?: AbortSignal,
  onProgress?: ExtractProgress,
): Promise<ExtractResult> {
  if (!canRecognize(file)) {
    throw new DocumentError(
      "unsupported",
      "这种格式暂不能自动识别。原件已保留，可以手工归类并填写字段。",
    );
  }
  onProgress?.(0.02, "准备原件副本");
  try {
    if (file.type === "application/pdf") {
      return await extractPdf(file, signal, onProgress);
    }
    return await extractImage(file, onProgress);
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw new DocumentError(
      "ocr",
      "识别过程中出错。请重试，或手工填写字段；原件不会被发送到网络。",
    );
  }
}

export async function disposeRecognition(): Promise<void> {
  await cancelOcr();
}
