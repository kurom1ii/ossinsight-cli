import { API_BASE, fetchJson, extractRows } from "../api.js";
import { heading, table, fmtNum, type Column } from "../format.js";

export async function collections(search?: string): Promise<string> {
  const data = await fetchJson(`${API_BASE}/v1/collections`);
  let rows = extractRows(data);

  if (rows.length === 0) {
    return "ERROR: Could not fetch collections from OSSInsight API";
  }

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => (r.name || "").toLowerCase().includes(q));
  }

  const lines: string[] = [];
  lines.push(heading("OSSInsight Collections", search ? `Filter: "${search}" | Matches: ${rows.length}` : `Total: ${rows.length} collections`));
  lines.push("Use collection ID with: ossinsight ranking <id>\n");

  const cols: Column[] = [
    { key: "id", header: "ID", width: 7, align: "right" },
    { key: "name", header: "Collection Name", width: 50 },
  ];

  lines.push(table(rows, cols));

  return lines.join("\n");
}
