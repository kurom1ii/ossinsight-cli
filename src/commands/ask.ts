import { WEB_BASE, postJson } from "../api.js";
import { heading, section, table, type Column } from "../format.js";

interface AskResponse {
  question?: { title: string; revisedTitle?: string; status: string; error?: string; errorType?: string };
  query?: { sql: string; spent: number };
  result?: {
    columns: Array<{ col: string; data_type: string }>;
    rows: Array<Record<string, unknown>>;
  };
}

export async function ask(question: string): Promise<string> {
  if (!question || question.length < 4) {
    return "ERROR: Please provide a question (min 4 characters).\n\nExamples:\n  ossinsight ask 'Which repos got the most stars last month?'\n  ossinsight ask 'Top Python projects by contributors in 2024'\n  ossinsight ask 'Compare star growth of React vs Vue vs Angular'";
  }

  const lines: string[] = [];
  lines.push(heading("OSSInsight AI Explorer", `Question: ${question}`));
  lines.push("Using AI to generate SQL and query 6B+ GitHub events...\n");

  let resp: AskResponse;
  try {
    resp = await postJson<AskResponse>(`${WEB_BASE}/api/explorer/ask`, {
      question,
      stream: false,
    });
  } catch (e) {
    return `${lines.join("\n")}\nERROR: AI Explorer request failed. ${(e as Error).message}\n\nThe AI Explorer may be temporarily unavailable. Try again later or use specific commands:\n  ossinsight trending\n  ossinsight repo <owner/repo>\n  ossinsight ranking <collection-id>`;
  }

  // Check status
  if (resp.question?.status === "error") {
    lines.push(`ERROR: ${resp.question.error || "Unknown error"}`);
    if (resp.question.errorType) lines.push(`Error type: ${resp.question.errorType}`);
    return lines.join("\n");
  }

  // Show generated SQL
  if (resp.query?.sql) {
    lines.push(section("Generated SQL"));
    lines.push("```sql");
    lines.push(resp.query.sql);
    lines.push("```");
    if (resp.query.spent) lines.push(`Query time: ${resp.query.spent}ms`);
  }

  // Show results
  if (resp.result?.rows && resp.result.rows.length > 0) {
    lines.push(section("Results"));

    const columns = resp.result.columns || [];
    const rows = resp.result.rows;

    if (columns.length > 0) {
      // Auto-size columns based on content
      const cols: Column[] = columns.map((c) => {
        const maxLen = Math.max(
          c.col.length,
          ...rows.slice(0, 20).map((r) => String(r[c.col] ?? "").length)
        );
        const width = Math.min(Math.max(maxLen, 8), 40);
        return {
          key: c.col,
          header: c.col,
          width,
          align: ["BIGINT", "INT", "DECIMAL", "DOUBLE", "FLOAT"].includes(c.data_type) ? "right" as const : "left" as const,
        };
      });

      // Convert to string records
      const strRows = rows.slice(0, 50).map((r) => {
        const sr: Record<string, string> = {};
        for (const c of columns) {
          sr[c.col] = String(r[c.col] ?? "N/A");
        }
        return sr;
      });

      lines.push(table(strRows, cols));
      if (rows.length > 50) lines.push(`\n... and ${rows.length - 50} more rows`);
    } else {
      // Fallback: dump as key-value
      for (const row of rows.slice(0, 20)) {
        lines.push("");
        for (const [k, v] of Object.entries(row)) {
          lines.push(`  ${k}: ${v}`);
        }
      }
    }

    lines.push(`\nTotal rows: ${rows.length}`);
  } else {
    lines.push("\nNo results returned.");
  }

  if (resp.question?.revisedTitle) {
    lines.push(`\nRevised question: ${resp.question.revisedTitle}`);
  }

  return lines.join("\n");
}
