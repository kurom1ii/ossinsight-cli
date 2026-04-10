import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, section, table, fmtNum, fmtPct, kvBlock, type Column } from "../format.js";

export async function repo(repoPath: string): Promise<string> {
  const [owner, repoName] = repoPath.split("/");
  if (!owner || !repoName) {
    return "ERROR: Please provide repo in format: owner/repo (e.g. facebook/react)";
  }

  // Fetch all data in parallel
  const [ghData, starsCountry, starsHistory, prCreators, issueCreators] = await Promise.allSettled([
    fetchJson(`${API_BASE}/gh/repo/${owner}/${repoName}`),
    fetchJson(`${API_BASE}/v1/repos/${owner}/${repoName}/stargazers/countries`),
    fetchJson(`${API_BASE}/v1/repos/${owner}/${repoName}/stargazers/history?per=month`),
    fetchJson(`${API_BASE}/v1/repos/${owner}/${repoName}/pull_request_creators?sort=prs-desc&page_size=10`),
    fetchJson(`${API_BASE}/v1/repos/${owner}/${repoName}/issue_creators?sort=issues-desc&page_size=10`),
  ]);

  const lines: string[] = [];
  lines.push(heading(`OSSInsight Repo Analysis: ${owner}/${repoName}`));

  // Basic info from GitHub proxy
  if (ghData.status === "fulfilled") {
    const d = (ghData.value as Record<string, unknown>).data as Record<string, unknown>;
    if (d) {
      lines.push(section("Overview"));
      lines.push(kvBlock([
        ["Description", String(d.description || "N/A")],
        ["Language", String(d.language || "N/A")],
        ["License", d.license ? String((d.license as Record<string, string>).spdx_id || "N/A") : "N/A"],
        ["Stars", fmtNum(String(d.stargazers_count ?? 0))],
        ["Forks", fmtNum(String(d.forks_count ?? 0))],
        ["Open Issues", fmtNum(String(d.open_issues_count ?? 0))],
        ["Watchers", fmtNum(String(d.subscribers_count ?? 0))],
        ["Size", `${fmtNum(String(d.size ?? 0))} KB`],
        ["Created", String(d.created_at || "N/A")],
        ["Last Push", String(d.pushed_at || "N/A")],
        ["Default Branch", String(d.default_branch || "main")],
        ["Topics", Array.isArray(d.topics) ? (d.topics as string[]).join(", ") : "N/A"],
        ["Archived", d.archived ? "Yes" : "No"],
      ]));
    }
  } else {
    lines.push(`\nWARNING: Could not fetch repo metadata: ${ghData.reason}`);
  }

  // Star history (recent trend)
  if (starsHistory.status === "fulfilled") {
    const rows = extractRows(starsHistory.value);
    if (rows.length > 0) {
      lines.push(section("Star Growth (Recent Months)"));
      const recent = rows.slice(-12);
      const growthCols: Column[] = [
        { key: "date", header: "Month", width: 12 },
        { key: "stargazers", header: "Total Stars", width: 12, align: "right", format: fmtNum },
      ];
      // Add monthly delta
      const withDelta = recent.map((r, i) => {
        const prev = i > 0 ? parseInt(recent[i - 1].stargazers || "0") : parseInt(r.stargazers || "0");
        const curr = parseInt(r.stargazers || "0");
        const delta = i > 0 ? curr - prev : 0;
        return { ...r, _delta: delta > 0 ? `+${fmtNum(delta)}` : delta === 0 ? "-" : fmtNum(delta) };
      });
      growthCols.push({ key: "_delta", header: "Monthly +/-", width: 12, align: "right" });
      lines.push(table(withDelta, growthCols));
    }
  }

  // Top countries
  if (starsCountry.status === "fulfilled") {
    const rows = extractRows(starsCountry.value);
    if (rows.length > 0) {
      lines.push(section("Stargazer Countries (Top 10)"));
      const countryCols: Column[] = [
        { key: "country_code", header: "Country", width: 10 },
        { key: "stargazers", header: "Stars", width: 10, align: "right", format: fmtNum },
        { key: "percentage", header: "Share", width: 8, align: "right", format: fmtPct },
      ];
      lines.push(table(rows.slice(0, 10), countryCols));
    }
  }

  // Top PR contributors
  if (prCreators.status === "fulfilled") {
    const rows = extractRows(prCreators.value);
    if (rows.length > 0) {
      lines.push(section("Top PR Contributors"));
      const prCols: Column[] = [
        { key: "login", header: "Developer", width: 22 },
        { key: "name", header: "Name", width: 20 },
        { key: "prs", header: "PRs", width: 7, align: "right", format: fmtNum },
        { key: "first_pr_merged_at", header: "First Merged", width: 20 },
      ];
      lines.push(table(rows.slice(0, 10), prCols));
    }
  }

  // Top issue creators
  if (issueCreators.status === "fulfilled") {
    const rows = extractRows(issueCreators.value);
    if (rows.length > 0) {
      lines.push(section("Top Issue Reporters"));
      const issCols: Column[] = [
        { key: "login", header: "Developer", width: 22 },
        { key: "name", header: "Name", width: 20 },
        { key: "issues", header: "Issues", width: 7, align: "right", format: fmtNum },
        { key: "first_issue_opened_at", header: "First Issue", width: 20 },
      ];
      lines.push(table(rows.slice(0, 10), issCols));
    }
  }

  lines.push(`\nMore: https://ossinsight.io/analyze/${owner}/${repoName}`);
  return lines.join("\n");
}
