import { NextResponse } from "next/server";
import {
  fetchAggregator,
  misconfiguredSecretResponse,
} from "@/lib/server/aggregator";
import {
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
  setAuthCookies,
} from "@/lib/server/cookies";
import type { AuthTokens, User } from "@/lib/types";

async function refreshTokens(): Promise<AuthTokens | null> {
  const refresh = await readRefreshToken();
  if (!refresh) return null;

  const upstream = await fetchAggregator("/auth/token/refresh", {
    method: "POST",
    body: { refresh_token: refresh },
  });
  if (!upstream.ok) return null;

  const json = (await upstream.json()) as Partial<AuthTokens>;
  if (typeof json.access_token !== "string" || typeof json.refresh_token !== "string") {
    return null;
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    token_type: typeof json.token_type === "string" ? json.token_type : "bearer",
  };
}

async function fetchMe(accessToken: string): Promise<User | null> {
  const meRes = await fetchAggregator("/auth/me", { accessToken });
  if (!meRes.ok) return null;
  return (await meRes.json()) as User;
}

function unauthorized() {
  const res = NextResponse.json({ user: null }, { status: 401 });
  clearAuthCookies(res);
  return res;
}

export async function GET() {
  try {
    let access = await readAccessToken();
    let refreshed: AuthTokens | null = null;

    if (!access) {
      refreshed = await refreshTokens();
      if (!refreshed) return unauthorized();
      access = refreshed.access_token;
    }

    let user = await fetchMe(access);
    if (!user) {
      refreshed = await refreshTokens();
      if (!refreshed) return unauthorized();
      user = await fetchMe(refreshed.access_token);
      if (!user) return unauthorized();
    }

    const res = NextResponse.json({ user });
    if (refreshed) setAuthCookies(res, refreshed);
    return res;
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ user: null }, { status: 502 });
  }
}
