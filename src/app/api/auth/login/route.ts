import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
} from "@/lib/server/aggregator";
import { setAuthCookies, type CookiePersistence } from "@/lib/server/cookies";
import type { AuthTokens, User } from "@/lib/types";

function isAuthTokens(value: unknown): value is AuthTokens {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.access_token === "string" && typeof v.refresh_token === "string";
}

export async function POST(req: NextRequest) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetchAggregator("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }

  const text = await upstream.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json({ message: "Invalid aggregator response" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(json ?? { message: "Login failed" }, { status: upstream.status });
  }

  if (!isAuthTokens(json)) {
    return NextResponse.json({ message: "Unexpected login response" }, { status: 502 });
  }

  const persistence: CookiePersistence = body.remember === false ? "session" : "persistent";
  let user: User | null = null;
  try {
    const meRes = await fetchAggregator("/auth/me", { accessToken: json.access_token });
    if (meRes.ok) {
      user = (await meRes.json()) as User;
    }
  } catch {
    user = null;
  }

  const res = NextResponse.json({ user }, { status: 200 });
  setAuthCookies(res, json, persistence);
  return res;
}
