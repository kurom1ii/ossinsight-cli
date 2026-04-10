import { API_BASE, fetchJson, extractRows } from "../api.js";
import { table, heading, section, fmtNum, type Column } from "../format.js";

const LANGUAGES = [
  "All", "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "C++",
  "C", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Shell", "Elixir",
  "Haskell", "Scala", "R", "Lua", "Clojure", "Erlang", "OCaml", "Perl",
  "Fortran", "HTML", "CSS", "Solidity", "Assembly", "Julia", "MATLAB",
  "Objective-C", "Common Lisp", "Emacs Lisp", "PLpgSQL", "TSQL",
  "Groovy", "CMake", "PowerShell", "HCL",
];

const PERIODS = ["past_24_hours", "past_week", "past_month", "past_3_months"];

export async function trending(language = "All", period = "past_week"): Promise<string> {
  const lang = encodeURIComponent(language);
  const url = `${API_BASE}/v1/trends/repos?period=${period}&language=${lang}`;

  let data: unknown;
  try {
    data = await fetchJson(url);
  } catch (e) {
    return `ERROR: Failed to fetch trending repos. ${(e as Error).message}\n\nAvailable languages: ${LANGUAGES.join(", ")}\nAvailable periods: ${PERIODS.join(", ")}`;
  }

  const rows = extractRows(data);
  if (rows.length === 0) {
    return `No trending repos found for language=${language}, period=${period}\n\nTry: ossinsight trending --language All --period past_week`;
  }

  const lines: string[] = [];
  lines.push(heading("OSSInsight Trending Repositories", `Language: ${language} | Period: ${period} | Results: ${rows.length}`));
  lines.push("Source: github-events-database (6B+ events) via TiDB Cloud\n");

  const cols: Column[] = [
    { key: "_rank", header: "#", width: 3, align: "right" },
    { key: "repo_name", header: "Repository", width: 38 },
    { key: "primary_language", header: "Language", width: 12 },
    { key: "stars", header: "Stars", width: 7, align: "right", format: fmtNum },
    { key: "forks", header: "Forks", width: 7, align: "right", format: fmtNum },
    { key: "pull_requests", header: "PRs", width: 5, align: "right", format: fmtNum },
    { key: "total_score", header: "Score", width: 8, align: "right", format: (v) => parseFloat(v).toFixed(0) },
  ];

  const ranked = rows.slice(0, 30).map((r, i) => ({ ...r, _rank: String(i + 1) }));
  lines.push(table(ranked, cols));

  // Top 5 detail
  lines.push(section("Top 5 Detail"));
  for (const repo of rows.slice(0, 5)) {
    lines.push(`\n[${repo.repo_name}]`);
    lines.push(`  Description: ${repo.description || "N/A"}`);
    lines.push(`  Stars: ${fmtNum(repo.stars)} | Forks: ${fmtNum(repo.forks)} | PRs: ${fmtNum(repo.pull_requests)} | Pushes: ${fmtNum(repo.pushes || "0")}`);
    lines.push(`  Score: ${parseFloat(repo.total_score || "0").toFixed(1)}`);
    if (repo.contributor_logins) lines.push(`  Top Contributors: ${repo.contributor_logins}`);
    if (repo.collection_names) lines.push(`  Collections: ${repo.collection_names}`);
  }

  return lines.join("\n");
}
