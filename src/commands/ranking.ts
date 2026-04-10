import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, table, fmtNum, type Column } from "../format.js";

const METRICS = ["stars", "prs", "issues"] as const;
const PERIODS = ["past_28_days", "past_month"] as const;

export async function ranking(
  collectionId: string,
  metric = "stars",
  period = "past_28_days"
): Promise<string> {
  if (!collectionId || isNaN(parseInt(collectionId))) {
    return "ERROR: Please provide a valid collection ID. Use 'ossinsight collections' to list available IDs.";
  }

  const metricPath = `ranking_by_${metric}`;
  const url = `${API_BASE}/v1/collections/${collectionId}/${metricPath}?period=${period}`;

  let data: unknown;
  try {
    data = await fetchJson(url);
  } catch (e) {
    return `ERROR: Failed to fetch ranking. ${(e as Error).message}\n\nAvailable metrics: ${METRICS.join(", ")}\nAvailable periods: ${PERIODS.join(", ")}`;
  }

  const rows = extractRows(data);
  if (rows.length === 0) {
    return `No ranking data found for collection ${collectionId}, metric=${metric}, period=${period}`;
  }

  const lines: string[] = [];
  lines.push(heading(`OSSInsight Collection Ranking`, `Collection: ${collectionId} | Metric: ${metric} | Period: ${period}`));
  lines.push("");

  const cols: Column[] = [
    { key: "current_period_rank", header: "Rank", width: 5, align: "right" },
    { key: "repo_name", header: "Repository", width: 35 },
    { key: "current_period_growth", header: "Growth", width: 8, align: "right", format: fmtNum },
    { key: "past_period_growth", header: "Prev Growth", width: 12, align: "right", format: fmtNum },
    { key: "growth_pop", header: "Change%", width: 9, align: "right", format: (v) => `${parseFloat(v).toFixed(1)}%` },
    { key: "rank_pop", header: "Rank +/-", width: 9, align: "right", format: (v) => {
      const n = parseInt(v);
      return n > 0 ? `+${n}` : n === 0 ? "=" : String(n);
    }},
    { key: "total", header: "Total", width: 10, align: "right", format: fmtNum },
  ];

  lines.push(table(rows, cols));

  // Summary
  const top = rows[0];
  const totalGrowth = rows.reduce((s, r) => s + parseInt(r.current_period_growth || "0"), 0);
  lines.push(`\nLeader: ${top.repo_name} with ${fmtNum(top.current_period_growth)} ${metric} this period`);
  lines.push(`Total collection growth: ${fmtNum(totalGrowth)} ${metric}`);

  return lines.join("\n");
}
