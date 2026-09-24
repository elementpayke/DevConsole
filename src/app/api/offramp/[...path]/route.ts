import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
} from "@/lib/server/aggregator";
import {
  getAggregatorBaseUrl,
  getConsolePartnerApiKey,
} from "@/lib/server/env";
import { ACCESS_COOKIE } from "@/lib/server/cookies";
import type { User } from "@/lib/types";

/**
 * Merchant Off-ramp BFF: JWT session → Partner APIs with EP platform key.
 * Always overwrites customer_id from the merchant's linked vault customer.
 */

const ALLOWED_GET_EXACT = new Set([
  "catalog",
  "order-requirements",
  "payment-methods",
  "corridors",
  "rates/indicative",
]);

function isAllowed(method: string, joined: string): boolean {
  const path = joined.replace(/^\//, "");
  if (method === "GET" && ALLOWED_GET_EXACT.has(path)) return true;
  if (method === "POST" && path === "orders/quote") return true;
  if (method === "GET" && /^orders\/[A-Za-z0-9_.-]+$/.test(path)) return true;
  if (method === "POST" && /^orders\/[A-Za-z0-9_.-]+\/accept$/.test(path)) return true;
  return false;
}

async function loadMerchantUser(accessToken: string): Promise<User | null> {
  const meRes = await fetchAggregator("/auth/me", { accessToken });
  if (!meRes.ok) return null;
  return (await meRes.json()) as User;
}

async function partnerFetch(
  partnerPath: string,
  options: {
    method: string;
    body?: unknown;
    searchParams?: URLSearchParams;
  },
): Promise<Response> {
  const url = new URL(
    `${getAggregatorBaseUrl()}/partner/${partnerPath.replace(/^\//, "")}`,
  );
  options.searchParams?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("X-API-Key", getConsolePartnerApiKey());
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return fetch(url.toString(), {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
}

function extractOrderCustomerId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const order = (data.order ?? data) as Record<string, unknown>;
  const cid = order.customer_id;
  return typeof cid === "string" && cid.trim() ? cid.trim() : null;
}

/**
 * Prevent cross-merchant IDOR on shared partner key.
 * GET must belong to this merchant. Accept: if an order already exists for the
 * id/quote, require ownership; if not found yet, allow first-time accept.
 */
async function assertOrderOwnedByMerchant(
  method: string,
  joined: string,
  customerId: string,
): Promise<NextResponse | null> {
  const match = /^orders\/([A-Za-z0-9_.-]+)(\/accept)?$/.exec(joined);
  if (!match || joined === "orders/quote") return null;

  const orderKey = match[1];
  const isAccept = Boolean(match[2]);
  const check = await partnerFetch(`orders/${orderKey}`, { method: "GET" });

  if (!check.ok) {
    if (isAccept && method === "POST") return null;
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await check.json();
  } catch {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const orderCustomerId = extractOrderCustomerId(payload);
  if (!orderCustomerId || orderCustomerId !== customerId) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  // For GET, return the already-fetched owned payload (avoids a second round-trip).
  if (method === "GET") {
    return NextResponse.json(payload, { status: check.status });
  }
  return null;
}

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const originBlock = assertTrustedOrigin(req);
    if (originBlock) return originBlock;
  }

  try {
    getConsolePartnerApiKey();
  } catch {
    return NextResponse.json(
      { message: "CONSOLE_PARTNER_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let user: User | null;
  try {
    user = await loadMerchantUser(accessToken);
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Session lookup failed" }, { status: 502 });
  }

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== "merchant") {
    return NextResponse.json(
      { message: "Off-ramp is only available for merchant accounts" },
      { status: 403 },
    );
  }
  const customerId = (user.partner_customer_id || "").trim();
  if (!customerId) {
    return NextResponse.json(
      { message: "Merchant is not linked to a vault customer" },
      { status: 400 },
    );
  }

  const { path } = await context.params;
  const joined = (path ?? []).join("/");
  if (!joined || joined.includes("..") || !isAllowed(req.method, joined)) {
    return NextResponse.json({ message: "Path not allowed" }, { status: 400 });
  }

  let body: unknown;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const text = await req.text();
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
  }

  // Force customer_id on quote — never trust the client.
  if (req.method === "POST" && joined === "orders/quote") {
    const payload =
      body && typeof body === "object" ? { ...(body as Record<string, unknown>) } : {};
    delete payload.customer;
    payload.customer_id = customerId;
    if (!payload.order_type) payload.order_type = "OffRamp";
    body = payload;
  }

  try {
    const owned = await assertOrderOwnedByMerchant(req.method, joined, customerId);
    if (owned) return owned;

    const upstream = await partnerFetch(joined, {
      method: req.method,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      searchParams: req.nextUrl.searchParams,
    });
    const responseHeaders = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) responseHeaders.set("Content-Type", ct);
    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: `Aggregator unreachable at ${getAggregatorBaseUrl()}` },
      { status: 502 },
    );
  }
}

export const GET = handle;
export const POST = handle;
