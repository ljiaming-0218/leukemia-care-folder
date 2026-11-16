export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(text: string, fileName: string, mime: string): void {
  downloadBlob(new Blob([text], { type: mime }), fileName);
}

export function downloadOriginal(file: File, fileName: string): void {
  downloadBlob(file, fileName);
}
