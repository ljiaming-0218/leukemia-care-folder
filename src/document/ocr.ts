import type Tesseract from "tesseract.js";
import { DocumentError } from "./errors";

type TessWorker = Tesseract.Worker;

let workerPromise: Promise<TessWorker> | null = null;
let activeLogger: ((message: Tesseract.LoggerMessage) => void) | null = null;

function assetUrl(path: string): string {
  return new URL(path, document.baseURI).href;
}

async function getWorker(): Promise<TessWorker> {
  if (!workerPromise) {
    workerPromise = import("tesseract.js")
      .then(({ default: Tesseract }) =>
        Tesseract.createWorker(["chi_sim", "eng"], 1, {
          workerPath: assetUrl("ocr/worker.min.js"),
          corePath: assetUrl("ocr/core"),
          langPath: assetUrl("ocr/lang"),
          cacheMethod: "none",
          logger: (message) => activeLogger?.(message),
        }),
      )
      .catch((error) => {
        workerPromise = null;
        throw error;
      });
  }
  return workerPromise;
}

export function describeOcrStatus(status: string): string {
  switch (status) {
    case "loading tesseract core":
      return "加载本地识别内核";
    case "initializing tesseract":
      return "初始化识别内核";
    case "loading language traineddata":
      return "加载中英文语言包";
    case "initializing api":
      return "准备识别";
    case "recognizing text":
      return "识别文字";
    default:
      return "准备中";
  }
}

export async function recognizeImage(
  image: Blob,
  onProgress?: (progress: number, status: string) => void,
): Promise<string> {
  activeLogger = (message) => {
    onProgress?.(message.progress ?? 0, describeOcrStatus(message.status ?? ""));
  };
  try {
    const worker = await getWorker();
    const result = await worker.recognize(image);
    return result.data.text ?? "";
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw new DocumentError(
      "ocr",
      "本地文字识别没有完成。请重试，或手工填写字段；原件不会被发送到网络。",
    );
  } finally {
    activeLogger = null;
  }
}

export async function cancelOcr(): Promise<void> {
  const pending = workerPromise;
  workerPromise = null;
  activeLogger = null;
  if (!pending) return;
  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // 识别内核尚未创建完成或已经终止，忽略清理失败。
  }
}
