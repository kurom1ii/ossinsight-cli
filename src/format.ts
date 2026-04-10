// Text formatter for LLM-friendly output

function padRight(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : s + " ".repeat(w - s.length);
}

function padLeft(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : " ".repeat(w - s.length) + s;
}

function fmtNum(n: string | number): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("en-US");
}

function fmtPct(n: string | number): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "N/A";
  return (num * 100).toFixed(1) + "%";
}

function separator(widths: number[]): string {
  return widths.map((w) => "-".repeat(w)).join("-+-");
}

interface Column {
  key: string;
  header: string;
  width: number;
  align?: "left" | "right";
  format?: (val: string) => string;
}

function table(rows: Array<Record<string, string>>, columns: Column[]): string {
  const lines: string[] = [];
  // Header
  const hdr = columns
    .map((c) => padRight(c.header, c.width))
    .join(" | ");
  lines.push(hdr);
  lines.push(separator(columns.map((c) => c.width)));
  // Rows
  for (const row of rows) {
    const cells = columns.map((c) => {
      let val = row[c.key] ?? "N/A";
      if (c.format) val = c.format(val);
      return c.align === "right" ? padLeft(val, c.width) : padRight(val, c.width);
    });
    lines.push(cells.join(" | "));
  }
  return lines.join("\n");
}

function heading(title: string, subtitle?: string): string {
  let out = `=== ${title} ===`;
  if (subtitle) out += `\n${subtitle}`;
  return out;
}

function section(title: string): string {
  return `\n--- ${title} ---`;
}

function kvLine(key: string, value: string | number): string {
  return `  ${key}: ${value}`;
}

function kvBlock(pairs: Array<[string, string | number]>): string {
  return pairs.map(([k, v]) => kvLine(k, v)).join("\n");
}

export { padRight, padLeft, fmtNum, fmtPct, separator, table, heading, section, kvLine, kvBlock };
export type { Column };
