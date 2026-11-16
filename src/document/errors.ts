export type DocumentErrorCode = "password" | "pdf" | "ocr" | "unsupported" | "cancelled";

export class DocumentError extends Error {
  code: DocumentErrorCode;

  constructor(code: DocumentErrorCode, message: string) {
    super(message);
    this.name = "DocumentError";
    this.code = code;
  }
}
