import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, section, fmtNum, fmtPct, padRight, padLeft } from "../format.js";

export async function compare(repo1: string, repo2: string): Promise<string> {
  const [owner1, name1] = repo1.split("/");
  const [owner2, name2] = repo2.split("/");
  if (!owner1 || !name1 || !owner2 || !name2) {
    return "ERROR: Please provide repos in format: owner1/repo1 owner2/repo2";
  }

  // Fetch data for both repos in parallel
  const [gh1, gh2, stars1, stars2, country1, country2, pr1, pr2] = await Promise.allSettled([
    fetchJson(`${API_BASE}/gh/repo/${owner1}/${name1}`),
    fetchJson(`${API_BASE}/gh/repo/${owner2}/${name2}`),
    fetchJson(`${API_BASE}/v1/repos/${owner1}/${name1}/stargazers/history?per=month`),
    fetchJson(`${API_BASE}/v1/repos/${owner2}/${name2}/stargazers/history?per=month`),
    fetchJson(`${API_BASE}/v1/repos/${owner1}/${name1}/stargazers/countries`),
    fetchJson(`${API_BASE}/v1/repos/${owner2}/${name2}/stargazers/countries`),
    fetchJson(`${API_BASE}/v1/repos/${owner1}/${name1}/pull_request_creators?sort=prs-desc&page_size=5`),
    fetchJson(`${API_BASE}/v1/repos/${owner2}/${name2}/pull_request_creators?sort=prs-desc&page_size=5`),
  ]);

  const lines: string[] = [];
  lines.push(heading(`OSSInsight Compare: ${repo1} vs ${repo2}`));

  // Side-by-side metrics
  const getGh = (r: PromiseSettledResult<unknown>) => {
    if (r.status === "fulfilled") {
      return (r.value as Record<string, unknown>).data as Record<string, unknown>;
    }
    return null;
  };

  const d1 = getGh(gh1);
  const d2 = getGh(gh2);

  if (d1 && d2) {
    lines.push(section("Head-to-Head Comparison"));
    const metrics: Array<[string, string, string]> = [
      ["Metric", repo1, repo2],
    ];

    const compare = (key: string, label: string) => {
      const v1 = String(d1[key] ?? "N/A");
      const v2 = String(d2[key] ?? "N/A");
      metrics.push([label, fmtNum(v1), fmtNum(v2)]);
    };

    compare("stargazers_count", "Stars");
    compare("forks_count", "Forks");
    compare("open_issues_count", "Open Issues");
    compare("subscribers_count", "Watchers");
    compare("size", "Size (KB)");
    metrics.push(["Language", String(d1.language || "N/A"), String(d2.language || "N/A")]);
    metrics.push(["License", d1.license ? String((d1.license as Record<string, string>).spdx_id) : "N/A", d2.license ? String((d2.license as Record<string, string>).spdx_id) : "N/A"]);
    metrics.push(["Created", String(d1.created_at || "N/A").split("T")[0], String(d2.created_at || "N/A").split("T")[0]]);
    metrics.push(["Last Push", String(d1.pushed_at || "N/A").split("T")[0], String(d2.pushed_at || "N/A").split("T")[0]]);
    metrics.push(["Archived", d1.archived ? "Yes" : "No", d2.archived ? "Yes" : "No"]);
    metrics.push(["Topics", Array.isArray(d1.topics) ? (d1.topics as string[]).slice(0, 3).join(",") : "N/A", Array.isArray(d2.topics) ? (d2.topics as string[]).slice(0, 3).join(",") : "N/A"]);

    // Format as table
    const w0 = 16, w1 = 22, w2 = 22;
    lines.push(`${padRight("Metric", w0)} | ${padRight(repo1, w1)} | ${padRight(repo2, w2)}`);
    lines.push(`${"-".repeat(w0)}-+-${"-".repeat(w1)}-+-${"-".repeat(w2)}`);
    for (const [label, v1, v2] of metrics.slice(1)) {
      lines.push(`${padRight(label, w0)} | ${padLeft(v1, w1)} | ${padLeft(v2, w2)}`);
    }

    // Winner summary
    const s1 = parseInt(String(d1.stargazers_count ?? 0));
    const s2 = parseInt(String(d2.stargazers_count ?? 0));
    const f1 = parseInt(String(d1.forks_count ?? 0));
    const f2 = parseInt(String(d2.forks_count ?? 0));
    lines.push(`\nStar Leader: ${s1 > s2 ? repo1 : repo2} (${fmtNum(Math.abs(s1 - s2))} more)`);
    lines.push(`Fork Leader: ${f1 > f2 ? repo1 : repo2} (${fmtNum(Math.abs(f1 - f2))} more)`);
  }

  // Star growth comparison (last 6 months)
  if (stars1.status === "fulfilled" && stars2.status === "fulfilled") {
    const rows1 = extractRows(stars1.value);
    const rows2 = extractRows(stars2.value);
    if (rows1.length > 0 && rows2.length > 0) {
      lines.push(section("Star Growth (Last 6 Months)"));
      const recent1 = rows1.slice(-6);
      const recent2 = rows2.slice(-6);
      const w0 = 12, w1 = 14, w2 = 14;
      lines.push(`${padRight("Month", w0)} | ${padLeft(repo1, w1)} | ${padLeft(repo2, w2)}`);
      lines.push(`${"-".repeat(w0)}-+-${"-".repeat(w1)}-+-${"-".repeat(w2)}`);
      const maxLen = Math.max(recent1.length, recent2.length);
      for (let i = 0; i < maxLen; i++) {
        const date = recent1[i]?.date || recent2[i]?.date || "";
        const v1 = recent1[i] ? fmtNum(recent1[i].stargazers) : "N/A";
        const v2 = recent2[i] ? fmtNum(recent2[i].stargazers) : "N/A";
        lines.push(`${padRight(date, w0)} | ${padLeft(v1, w1)} | ${padLeft(v2, w2)}`);
      }
    }
  }

  // Country comparison (top 5 each)
  if (country1.status === "fulfilled" && country2.status === "fulfilled") {
    const c1 = extractRows(country1.value).slice(0, 5);
    const c2 = extractRows(country2.value).slice(0, 5);
    if (c1.length > 0 || c2.length > 0) {
      lines.push(section("Top Stargazer Countries"));
      lines.push(`\n${repo1}:`);
      for (const r of c1) lines.push(`  ${r.country_code}: ${fmtNum(r.stargazers)} (${fmtPct(r.percentage)})`);
      lines.push(`\n${repo2}:`);
      for (const r of c2) lines.push(`  ${r.country_code}: ${fmtNum(r.stargazers)} (${fmtPct(r.percentage)})`);
    }
  }

  // Top contributors comparison
  if (pr1.status === "fulfilled" && pr2.status === "fulfilled") {
    const p1 = extractRows(pr1.value).slice(0, 5);
    const p2 = extractRows(pr2.value).slice(0, 5);
    if (p1.length > 0 || p2.length > 0) {
      lines.push(section("Top PR Contributors"));
      lines.push(`\n${repo1}: ${p1.map((r) => `${r.login}(${r.prs})`).join(", ")}`);
      lines.push(`${repo2}: ${p2.map((r) => `${r.login}(${r.prs})`).join(", ")}`);
    }
  }

  lines.push(`\nMore: https://ossinsight.io/analyze/${owner1}/${name1}?vs=${owner2}/${name2}`);
  return lines.join("\n");
}
