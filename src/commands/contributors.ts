import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, section, table, fmtNum, fmtPct, type Column } from "../format.js";

type ContribType = "prs" | "issues";

export async function contributors(repoPath: string, type: ContribType = "prs"): Promise<string> {
  const [owner, repoName] = repoPath.split("/");
  if (!owner || !repoName) {
    return "ERROR: Please provide repo in format: owner/repo";
  }

  const endpoint = type === "prs" ? "pull_request_creators" : "issue_creators";
  const base = `${API_BASE}/v1/repos/${owner}/${repoName}/${endpoint}`;
  const label = type === "prs" ? "PR Contributors" : "Issue Reporters";

  const lines: string[] = [];
  lines.push(heading(`OSSInsight ${label}: ${owner}/${repoName}`));

  // Fetch all data in parallel
  const [listData, historyData, countryData, orgData] = await Promise.allSettled([
    fetchJson(`${base}?sort=${type === "prs" ? "prs-desc" : "issues-desc"}&page_size=30`),
    fetchJson(`${base}/history?per=month`),
    fetchJson(`${base}/countries`),
    fetchJson(`${base}/organizations`),
  ]);

  // Contributor list
  if (listData.status === "fulfilled") {
    const rows = extractRows(listData.value);
    if (rows.length > 0) {
      lines.push(section(`Top ${label}`));
      if (type === "prs") {
        const cols: Column[] = [
          { key: "_rank", header: "#", width: 3, align: "right" },
          { key: "login", header: "Developer", width: 22 },
          { key: "name", header: "Name", width: 20 },
          { key: "prs", header: "PRs", width: 7, align: "right", format: fmtNum },
          { key: "first_pr_opened_at", header: "First PR", width: 20 },
          { key: "first_pr_merged_at", header: "First Merged", width: 20 },
        ];
        const ranked = rows.map((r, i) => ({ ...r, _rank: String(i + 1) }));
        lines.push(table(ranked, cols));
      } else {
        const cols: Column[] = [
          { key: "_rank", header: "#", width: 3, align: "right" },
          { key: "login", header: "Developer", width: 22 },
          { key: "name", header: "Name", width: 20 },
          { key: "issues", header: "Issues", width: 7, align: "right", format: fmtNum },
          { key: "first_issue_opened_at", header: "First Issue", width: 20 },
        ];
        const ranked = rows.map((r, i) => ({ ...r, _rank: String(i + 1) }));
        lines.push(table(ranked, cols));
      }
    }
  } else {
    lines.push(`\nERROR: Failed to fetch contributor list: ${listData.reason}`);
  }

  // Growth history
  if (historyData.status === "fulfilled") {
    const rows = extractRows(historyData.value);
    if (rows.length > 0) {
      lines.push(section(`${label} Growth (Last 12 Months)`));
      const recent = rows.slice(-12);
      const countKey = type === "prs" ? "pull_request_creators" : "issue_creators";
      const withDelta = recent.map((r, i) => {
        const prev = i > 0 ? parseInt(recent[i - 1][countKey] || "0") : parseInt(r[countKey] || "0");
        const curr = parseInt(r[countKey] || "0");
        const delta = i > 0 ? curr - prev : 0;
        return { ...r, _total: r[countKey], _delta: delta > 0 ? `+${delta}` : String(delta) };
      });
      const cols: Column[] = [
        { key: "date", header: "Month", width: 12 },
        { key: "_total", header: `Total ${label}`, width: 18, align: "right", format: fmtNum },
        { key: "_delta", header: "Monthly +/-", width: 12, align: "right" },
      ];
      lines.push(table(withDelta, cols));
    }
  }

  // Country distribution
  if (countryData.status === "fulfilled") {
    const rows = extractRows(countryData.value);
    if (rows.length > 0) {
      lines.push(section(`${label} by Country (Top 10)`));
      const countKey = type === "prs" ? "pull_request_creators" : "issue_creators";
      const cols: Column[] = [
        { key: "country_code", header: "Country", width: 10 },
        { key: countKey, header: "Count", width: 8, align: "right", format: fmtNum },
        { key: "percentage", header: "Share", width: 8, align: "right", format: fmtPct },
      ];
      lines.push(table(rows.slice(0, 10), cols));
    }
  }

  // Organization distribution
  if (orgData.status === "fulfilled") {
    const rows = extractRows(orgData.value);
    if (rows.length > 0) {
      lines.push(section(`${label} by Organization (Top 15)`));
      const countKey = type === "prs" ? "pull_request_creators" : "issue_creators";
      const cols: Column[] = [
        { key: "org_name", header: "Organization", width: 25 },
        { key: countKey, header: "Count", width: 8, align: "right", format: fmtNum },
        { key: "percentage", header: "Share", width: 8, align: "right", format: fmtPct },
      ];
      lines.push(table(rows.slice(0, 15), cols));
    }
  }

  lines.push(`\nMore: https://ossinsight.io/analyze/${owner}/${repoName}`);
  return lines.join("\n");
}
