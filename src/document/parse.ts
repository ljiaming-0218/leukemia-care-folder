import type { FieldKey, FieldRecord } from "../domain/documents";
import { normalizeLines, toIsoDate } from "./text";

export type SourcePage = { page: number; text: string };

export type ParsedFields = Partial<Record<FieldKey, FieldRecord>>;

const datePattern = /(\d{4})[年\-/.](\d{1,2})[月\-/.](\d{1,2})日?/;
const amountPattern =
  /(价税合计|金额合计|合计金额|总金额|实收金额|小写|合计)\s*[（(]?小写[）)]?\s*[:：]?\s*[¥￥]?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/;

const paymentWords = /支付|报销|自付|自费|补助|救助|退款|余额|红冲|作废/;

type Located = { value: string; page: number; snippet: string };

function labelValue(
  lines: string[],
  label: RegExp,
  value: RegExp,
): Located | undefined {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const labelMatch = label.exec(line);
    if (!labelMatch) continue;
    const rest = line.slice(labelMatch.index + labelMatch[0].length);
    const inline = value.exec(rest);
    if (inline) {
      return { value: inline[0], page: 0, snippet: line };
    }
    const next = lines[index + 1];
    if (next) {
      const trailing = new RegExp(`^\\s*[:：]?\\s*(${value.source})`).exec(next);
      if (trailing) {
        return { value: trailing[1], page: 0, snippet: `${line} ${next}` };
      }
    }
  }
  return undefined;
}

function findAmount(lines: string[]): Located | undefined {
  let best: { score: number; value: string; snippet: string } | undefined;
  lines.forEach((line) => {
    const match = amountPattern.exec(line);
    if (!match) return;
    let score = 2;
    if (line.includes("价税合计")) score = 5;
    else if (line.includes("金额合计") || line.includes("合计金额")) score = 4;
    else if (line.includes("总金额") || line.includes("实收金额")) score = 4;
    else if (line.includes("小写")) score = 3;
    if (paymentWords.test(line)) score -= 3;
    const raw = match[2].replace(/,/g, "");
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return;
    if (!best || score > best.score) {
      best = { score, value: raw, snippet: line };
    }
  });
  if (best && best.score >= 1) {
    return { value: best.value, page: 0, snippet: best.snippet };
  }

  let fallback: { amount: number; value: string; snippet: string } | undefined;
  lines.forEach((line) => {
    if (paymentWords.test(line)) return;
    const matches = line.match(/[¥￥]\s*([0-9][0-9,]*\.[0-9]{2})/g);
    matches?.forEach((rawMatch) => {
      const digits = rawMatch.replace(/[¥￥,\s]/g, "");
      const amount = Number(digits);
      if (!Number.isFinite(amount)) return;
      if (!fallback || amount > fallback.amount) {
        fallback = { amount, value: digits, snippet: line };
      }
    });
  });
  return fallback
    ? { value: fallback.value, page: 0, snippet: fallback.snippet }
    : undefined;
}

function findIssuer(lines: string[]): Located | undefined {
  const labeled = labelValue(
    lines,
    /(?:开票单位|收款单位|开具机构|医疗机构|销售方名称|销售方)\s*[:：]?/,
    /[^\n,，;；]{2,40}/,
  );
  if (labeled) {
    const value = labeled.value.replace(/[（(].*?[）)]\s*$/, "").trim();
    if (value) return { ...labeled, value };
  }
  const candidate = lines.find(
    (line) =>
      /医院|卫生院|妇幼保健|诊所|医疗中心|药房|药店|检测中心|检验所/.test(line) &&
      !/医保|社会保险|医疗保障局|税务局|地址|电话/.test(line) &&
      line.length >= 4 &&
      line.length <= 40,
  );
  if (!candidate) return undefined;
  return {
    value: candidate.replace(/^(名称|机构)\s*[:：]?\s*/, "").trim(),
    page: 0,
    snippet: candidate,
  };
}

function findItemText(lines: string[]): Located | undefined {
  const labeled = labelValue(
    lines,
    /(?:项目名称|收费项目|项目内容|药品名称|检测项目)\s*[:：]?/,
    /[^\n]{2,60}/,
  );
  if (labeled) {
    return { ...labeled, value: labeled.value.replace(/^[:：\s]+/, "").trim() };
  }
  const keywords = new Set<string>();
  const keywordPattern =
    /基因检测|外购药|西药费|中成药费|检测费|检验费|药品费|治疗费|检查费|化验费|床位费|护理费|手术费|材料费|诊查费|自费药/g;
  lines.forEach((line) => {
    const matched = line.match(keywordPattern);
    matched?.forEach((keyword) => keywords.add(keyword));
  });
  if (!keywords.size) return undefined;
  const value = Array.from(keywords).join("、");
  return { value, page: 0, snippet: lines.find((line) => keywordPattern.test(line)) ?? value };
}

export function parsePages(pages: SourcePage[]): ParsedFields {
  const fields: ParsedFields = {};
  const collect = (
    key: FieldKey,
    finder: (lines: string[]) => Located | undefined,
    options?: { date?: boolean },
  ) => {
    for (const page of pages) {
      const located = finder(normalizeLines(page.text));
      if (!located) continue;
      let value = located.value;
      if (options?.date) {
        const dateMatch = datePattern.exec(located.snippet);
        if (!dateMatch) continue;
        const iso = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
        if (!iso) continue;
        value = iso;
      }
      fields[key] = {
        value,
        origin: "识别",
        page: page.page,
        snippet: located.snippet.slice(0, 160),
      };
      return;
    }
  };

  collect("invoiceNumber", (lines) =>
    labelValue(
      lines,
      /(?:发票号码|票据号码|发票号|票号|收据号)\s*[:：]?/,
      /[0-9A-Za-z]{6,24}/,
    ),
  );
  collect("issuer", findIssuer);
  collect(
    "invoiceDate",
    (lines) =>
      labelValue(lines, /(?:开票日期|发票日期)\s*[:：]?/, new RegExp(datePattern.source)),
    { date: true },
  );
  collect(
    "expenseDate",
    (lines) =>
      labelValue(
        lines,
        /(?:费用发生日期|就诊日期|收费日期|购药日期|发生日期|住院日期|出院日期)\s*[:：]?/,
        new RegExp(datePattern.source),
      ),
    { date: true },
  );
  collect("itemText", findItemText);
  collect("amountFen", findAmount);

  const amount = fields.amountFen;
  if (amount?.value) {
    amount.value = String(Math.round(Number(amount.value) * 100));
  }
  return fields;
}

export function mergeParsedFields(
  existing: Record<FieldKey, FieldRecord>,
  parsed: ParsedFields,
): Record<FieldKey, FieldRecord> {
  const merged = { ...existing };
  (Object.keys(parsed) as FieldKey[]).forEach((key) => {
    const next = parsed[key];
    if (!next) return;
    if (existing[key].origin === "家长填写" && existing[key].value) return;
    if (!next.value) return;
    merged[key] = next;
  });
  return merged;
}

export function recognizedFieldCount(fields: Record<FieldKey, FieldRecord>): number {
  return Object.values(fields).filter(
    (field) => field.origin === "识别" && field.value,
  ).length;
}
