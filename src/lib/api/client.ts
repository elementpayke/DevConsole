import type { ApiEnvelope } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Thin fetch wrapper around the aggregator API. Some endpoints (auth) return
 * the payload directly, while others wrap it in { status, message, data } —
 * callers pass `unwrap: false` for the former.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions & { unwrap?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, token, query, unwrap = true } = options;

  const headers: Record<string, string> = {};
  // Only set Content-Type when sending a body — an unnecessary header on a
  // bodyless GET turns it into a "non-simple" request and forces a CORS
  // preflight that a stricter server might not expect.
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch() throws the same generic TypeError for a dead server, a DNS
    // failure, and a CORS-blocked request — the browser deliberately hides
    // which one it was, so don't assert a specific cause here.
    const origin = typeof window !== "undefined" ? window.location.origin : "this origin";
    throw new ApiError(
      `Request to ${BASE_URL} did not get a response. Either the server is unreachable, ` +
        `or it's rejecting cross-origin requests from ${origin} (CORS) — check the browser's ` +
        `network tab for the failed request to see which.`,
      0,
    );
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (json && (json.message || json.detail)) ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, json);
  }

  if (!unwrap) return json as T;

  const envelope = json as ApiEnvelope<T>;
  return envelope.data;
}
