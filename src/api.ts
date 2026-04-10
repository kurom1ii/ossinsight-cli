// OSSInsight API client
const API_BASE = "https://api.ossinsight.io";
const WEB_BASE = "https://ossinsight.io";

interface ApiResponse {
  type?: string;
  data: {
    data?: {
      columns: Array<{ col: string; data_type: string; nullable: boolean }>;
      rows: Array<Record<string, string>>;
      result: {
        code: number;
        message: string;
        latency: string;
        row_count: number;
        limit: number;
      };
    };
    // gh endpoint format
    [key: string]: unknown;
  };
}

interface GhRepoResponse {
  data: {
    id: number;
    full_name: string;
    description: string;
    language: string;
    license: { spdx_id: string } | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    subscribers_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    default_branch: string;
    has_wiki: boolean;
    has_discussions: boolean;
    archived: boolean;
    owner: { login: string; avatar_url: string };
  };
}

interface ExplorerResponse {
  question?: { title: string; revisedTitle?: string; status: string; error?: string };
  query?: { sql: string; spent: number };
  result?: {
    columns: Array<{ col: string; data_type: string }>;
    rows: Array<Record<string, unknown>>;
  };
}

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "ossinsight-cli/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText} for ${url}`);
  }
  return resp.json() as Promise<T>;
}

async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ossinsight-cli/1.0",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText} for ${url}`);
  }
  return resp.json() as Promise<T>;
}

// Extract rows from v1 API response (handles nested envelope)
function extractRows(data: unknown): Array<Record<string, string>> {
  const d = data as Record<string, unknown>;
  // v1 format: { type, data: { columns, rows, result } }
  if (d?.data && typeof d.data === "object") {
    const inner = d.data as Record<string, unknown>;
    if (inner?.data && typeof inner.data === "object") {
      const innerData = inner.data as Record<string, unknown>;
      if (Array.isArray(innerData.rows)) return innerData.rows as Array<Record<string, string>>;
    }
    if (Array.isArray(inner.rows)) return inner.rows as Array<Record<string, string>>;
  }
  if (Array.isArray((d as Record<string, unknown>)?.rows)) {
    return (d as Record<string, unknown>).rows as Array<Record<string, string>>;
  }
  return [];
}

export {
  API_BASE,
  WEB_BASE,
  fetchJson,
  postJson,
  extractRows,
};
export type { ApiResponse, GhRepoResponse, ExplorerResponse };
