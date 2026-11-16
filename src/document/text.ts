export function toHalfWidth(input: string): string {
  return input
    .replace(/[\uFF01-\uFF5E]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    )
    .replace(/\u3000/g, " ");
}

export function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const collapsed = toHalfWidth(line).replace(/[ \t]+/g, " ").trim();
      // Tesseract 中文结果常在每个汉字和数字之间插入空格，含中文的行整体去空格再匹配。
      return /[\u3400-\u9fff]/.test(collapsed)
        ? collapsed.replace(/\s+/g, "")
        : collapsed;
    })
    .filter(Boolean);
}

export function toIsoDate(year: string, month: string, day: string): string | undefined {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d) return undefined;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return undefined;
  }
  return `${year.padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
