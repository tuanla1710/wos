export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function workspaceId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("workspaceId") || "";
}

export function setWorkspaceId(id: string) {
  localStorage.setItem("workspaceId", id);
}

function detailText(detail: unknown): string {
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === "string" ? item : item && typeof item === "object" && "msg" in item ? String((item as { msg: unknown }).msg) : ""))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function messageFor(status: number, data: { detail?: unknown }) {
  if (status === 401) return "Unauthorized";
  if (status === 500 || status === 502 || status === 503) return "Waiting for the API…";
  return detailText(data.detail) || "Couldn’t save. Try again.";
}

function requestHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (!headers["Content-Type"] && !(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const ws = workspaceId();
  if (ws) headers["X-Workspace-Id"] = ws;
  return headers;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = requestHeaders(init);
  let res: Response;
  try {
    res = await fetch(path.startsWith("/api") ? path : `/api${path}`, {
      ...init,
      credentials: "include",
      headers,
      signal: init?.signal ?? AbortSignal.timeout(8000),
    });
  } catch {
    throw new ApiError(502, "API is not running. Start it on port 8080.");
  }
  const text = await res.text();
  let data: { detail?: unknown } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { detail?: unknown };
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, messageFor(res.status, data));
  }
  return data as T;
}

async function parseError(res: Response): Promise<ApiError> {
  const text = await res.text();
  let data: { detail?: unknown } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { detail?: unknown };
    } catch {
      data = {};
    }
  }
  return new ApiError(res.status, messageFor(res.status, data));
}

export async function downloadReviewReport(weekStart?: string): Promise<void> {
  const q = weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : "";
  let res: Response;
  try {
    res = await fetch(`/api/review/export${q}`, {
      credentials: "include",
      headers: requestHeaders(),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new ApiError(502, "API is not running. Start it on port 8080.");
  }
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const match = /filename="?([^"]+)"?/.exec(res.headers.get("content-disposition") || "");
  const filename = match?.[1] || "Weekly-Review.pptx";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadBackup(): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/backup", {
      credentials: "include",
      headers: requestHeaders(),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new ApiError(502, "API is not running. Start it on port 8080.");
  }
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const match = /filename="?([^"]+)"?/.exec(res.headers.get("content-disposition") || "");
  const filename = match?.[1] || "workos-backup.zip";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File): Promise<{ ok: boolean; rows: number; uploads: number }> {
  const body = new FormData();
  body.append("file", file);
  body.append("confirm", "RESTORE");
  let res: Response;
  try {
    res = await fetch("/api/backup/restore", {
      method: "POST",
      credentials: "include",
      headers: requestHeaders({ body }),
      body,
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new ApiError(502, "API is not running. Start it on port 8080.");
  }
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { ok: boolean; rows: number; uploads: number };
}

export function priorityLabel(p: string) {
  return p === "high" ? "HIGH" : p === "low" ? "LOW" : "MEDIUM";
}

export function statusLabel(s: string) {
  if (s === "in_progress") return "In Progress";
  if (s === "blocked") return "Blocked";
  if (s === "done") return "Done";
  return "Todo";
}
