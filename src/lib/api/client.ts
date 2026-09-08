import type { ApiEnvelope } from "@/lib/types";

/** Same-origin BFF — never point the browser at the aggregator directly. */
const BFF_PREFIX = "/api/proxy";

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
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Absolute same-origin path (e.g. /api/auth/login). Defaults to BFF proxy. */
  absolutePath?: string;
};

function buildUrl(path: string, query?: RequestOptions["query"], absolutePath?: string) {
  const href = absolutePath
    ? absolutePath
    : `${BFF_PREFIX}/${path.replace(/^\//, "")}`;
  const url = new URL(
    href,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return `${url.pathname}${url.search}`;
}

/**
 * Thin fetch wrapper around the Next.js BFF. Auth cookies are httpOnly and
 * sent automatically via credentials: "include". Tokens never live in JS.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions & { unwrap?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, query, unwrap = true, absolutePath } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query, absolutePath), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      `Request to ${absolutePath ?? BFF_PREFIX} failed — the Next.js server may be down or unreachable.`,
      0,
    );
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      (json &&
        typeof json === "object" &&
        ((json as { message?: string }).message ||
          (json as { detail?: string }).detail)) ??
      `Request failed with status ${res.status}`;
    throw new ApiError(String(message), res.status, json);
  }

  if (!unwrap) return json as T;

  const envelope = json as ApiEnvelope<T>;
  return envelope.data;
}
