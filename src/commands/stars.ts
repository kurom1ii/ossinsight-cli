import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, section, table, fmtNum, fmtPct, type Column } from "../format.js";

type SubCommand = "all" | "countries" | "history" | "orgs";

export async function stars(repoPath: string, sub: SubCommand = "all"): Promise<string> {
  const [owner, repoName] = repoPath.split("/");
  if (!owner || !repoName) {
    return "ERROR: Please provide repo in format: owner/repo";
  }

  const base = `${API_BASE}/v1/repos/${owner}/${repoName}/stargazers`;
  const lines: string[] = [];
  lines.push(heading(`OSSInsight Stars Analysis: ${owner}/${repoName}`));

  const shouldFetch = (s: SubCommand) => sub === "all" || sub === s;

  const promises: Record<string, Promise<unknown>> = {};
  if (shouldFetch("history")) promises.history = fetchJson(`${base}/history?per=month`);
  if (shouldFetch("countries")) promises.countries = fetchJson(`${base}/countries`);
  if (shouldFetch("orgs")) promises.orgs = fetchJson(`${base}/organizations`);

  const results: Record<string, unknown> = {};
  for (const [key, promise] of Object.entries(promises)) {
    try {
      results[key] = await promise;
    } catch (e) {
      lines.push(`\nWARNING: Failed to fetch ${key}: ${(e as Error).message}`);
    }
  }

  // History
  if (results.history) {
    const rows = extractRows(results.history);
    if (rows.length > 0) {
      lines.push(section("Star Growth History (Last 12 Months)"));
      const recent = rows.slice(-12);
      const withDelta = recent.map((r, i) => {
        const prev = i > 0 ? parseInt(recent[i - 1].stargazers || "0") : parseInt(r.stargazers || "0");
        const curr = parseInt(r.stargazers || "0");
        const delta = i > 0 ? curr - prev : 0;
        return { ...r, _delta: delta > 0 ? `+${fmtNum(delta)}` : String(delta) };
      });
      const cols: Column[] = [
        { key: "date", header: "Month", width: 12 },
        { key: "stargazers", header: "Total Stars", width: 13, align: "right", format: fmtNum },
        { key: "_delta", header: "Monthly +/-", width: 12, align: "right" },
      ];
      lines.push(table(withDelta, cols));

      // Growth summary
      const first = parseInt(recent[0].stargazers || "0");
      const last = parseInt(recent[recent.length - 1].stargazers || "0");
      const growth = last - first;
      const avgMonthly = Math.round(growth / recent.length);
      lines.push(`\n12-month growth: +${fmtNum(growth)} stars (avg ${fmtNum(avgMonthly)}/month)`);
    }
  }

  // Countries
  if (results.countries) {
    const rows = extractRows(results.countries);
    if (rows.length > 0) {
      lines.push(section("Stargazer Countries (Top 15)"));
      const cols: Column[] = [
        { key: "country_code", header: "Country", width: 10 },
        { key: "stargazers", header: "Stars", width: 10, align: "right", format: fmtNum },
        { key: "percentage", header: "Share", width: 8, align: "right", format: fmtPct },
      ];
      lines.push(table(rows.slice(0, 15), cols));
    }
  }

  // Organizations
  if (results.orgs) {
    const rows = extractRows(results.orgs);
    if (rows.length > 0) {
      lines.push(section("Stargazer Organizations (Top 20)"));
      const cols: Column[] = [
        { key: "org_name", header: "Organization", width: 25 },
        { key: "stargazers", header: "Stars", width: 10, align: "right", format: fmtNum },
        { key: "percentage", header: "Share", width: 8, align: "right", format: fmtPct },
      ];
      lines.push(table(rows.slice(0, 20), cols));
    }
  }

  lines.push(`\nMore: https://ossinsight.io/analyze/${owner}/${repoName}`);
  return lines.join("\n");
}
