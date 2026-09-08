import { NextRequest, NextResponse } from "next/server";
import { getAggregatorBaseUrl, getFeClientSecret, isProductionRuntime } from "./env";

export type AggregatorFetchOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  query?: Record<string, string | undefined | null>;
};

/**
 * Server → aggregator request. Always attaches X-FE-Client-Secret.
 * Never forwards a client-supplied FE secret header.
 */
export async function fetchAggregator(
  path: string,
  options: AggregatorFetchOptions = {},
): Promise<Response> {
  const { method = "GET", body, accessToken, query } = options;
  const url = new URL(`${getAggregatorBaseUrl()}/${path.replace(/^\//, "")}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers = new Headers();
  headers.set("X-FE-Client-Secret", getFeClientSecret());
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

/** Forward upstream status/body; never leak server secrets into the payload. */
export async function nextResponseFromUpstream(upstream: Response): Promise<NextResponse> {
  const text = await upstream.text();
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  return new NextResponse(text, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

/**
 * Soft same-origin check for mutating BFF routes.
 * Blocks cross-site browser calls that would ride httpOnly cookies (CSRF).
 */
export function assertTrustedOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) {
    // Same-origin navigations and some tools omit Origin; allow non-browser or same-site GETs.
    // Mutating routes from browsers almost always send Origin.
    if (req.method === "GET" || req.method === "HEAD") return null;
    if (!isProductionRuntime()) return null;
    return NextResponse.json({ message: "Missing Origin" }, { status: 403 });
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return NextResponse.json({ message: "Invalid Origin" }, { status: 403 });
  }

  const host = req.headers.get("host");
  if (host && parsed.host !== host) {
    return NextResponse.json({ message: "Origin not allowed" }, { status: 403 });
  }
  return null;
}

export function misconfiguredSecretResponse(): NextResponse {
  return NextResponse.json(
    { message: "Server misconfigured: FE_CLIENT_SECRET is not set" },
    { status: 500 },
  );
}
