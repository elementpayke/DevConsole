import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  misconfiguredSecretResponse,
} from "@/lib/server/aggregator";
import { getAggregatorBaseUrl, getFeClientSecret } from "@/lib/server/env";
import { ACCESS_COOKIE } from "@/lib/server/cookies";
import { sanitizeProxyPath } from "@/lib/server/proxy-path";

/**
 * Same-origin BFF proxy to the ElementPay aggregator.
 *
 * Browser → /api/proxy/* → aggregator with server-only X-FE-Client-Secret.
 * Attaches Bearer from httpOnly access cookie when present.
 * Never trusts a client-supplied X-FE-Client-Secret.
 */

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const originBlock = assertTrustedOrigin(req);
    if (originBlock) return originBlock;
  }

  let secret: string;
  try {
    secret = getFeClientSecret();
  } catch {
    return misconfiguredSecretResponse();
  }

  const { path } = await context.params;
  let joined: string;
  try {
    joined = sanitizeProxyPath(path ?? []);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Invalid proxy path" },
      { status: 400 },
    );
  }

  const target = new URL(`${getAggregatorBaseUrl()}/${joined}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("X-FE-Client-Secret", secret);

  // Prefer cookie session; allow explicit Authorization only from same-origin BFF callers.
  // Never accept client-provided FE secret (stripped by not copying that header).
  const cookieToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const authorization = req.headers.get("authorization");
  if (cookieToken) {
    headers.set("Authorization", `Bearer ${cookieToken}`);
  } else if (authorization?.startsWith("Bearer ")) {
    headers.set("Authorization", authorization);
  }

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let body: ArrayBuffer | undefined;
  if (hasBody) {
    body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Aggregator unreachable at ${getAggregatorBaseUrl()}` },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
