import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/server/cookies";
import {
  fetchMe,
  refreshTokens,
  resolveSessionAccessToken,
} from "@/lib/server/session";
import type { AuthTokens, User } from "@/lib/types";

export type MerchantSessionContext = {
  user: User;
  accessToken: string;
  refreshed: AuthTokens | null;
};

type SessionRefreshDeps = {
  fetchMe: (accessToken: string) => Promise<User | null>;
  refreshTokens: () => Promise<AuthTokens | null>;
};

/**
 * Load /auth/me, refreshing tokens once when the access token is rejected.
 * Returns null when the session cannot be established.
 */
export async function resolveUserWithTokenRefresh(
  accessToken: string,
  refreshed: AuthTokens | null,
  deps: SessionRefreshDeps,
): Promise<{
  user: User;
  accessToken: string;
  refreshed: AuthTokens | null;
} | null> {
  let token = accessToken;
  let rotated = refreshed;
  let user = await deps.fetchMe(token);
  if (!user) {
    const next = await deps.refreshTokens();
    if (!next) return null;
    rotated = next;
    token = next.access_token;
    user = await deps.fetchMe(token);
    if (!user) return null;
  }
  return { user, accessToken: token, refreshed: rotated };
}

export async function requireMerchantSession(): Promise<
  MerchantSessionContext | NextResponse
> {
  const session = await resolveSessionAccessToken();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserWithTokenRefresh(
    session.accessToken,
    session.refreshed,
    { fetchMe, refreshTokens },
  );
  if (!resolved) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { user, accessToken, refreshed } = resolved;
  if (user.role !== "merchant") {
    return NextResponse.json(
      { message: "Merchant access only" },
      { status: 403 },
    );
  }

  return { user, accessToken, refreshed };
}

export function withRefreshedCookies(
  res: NextResponse,
  refreshed: AuthTokens | null,
): NextResponse {
  if (refreshed) setAuthCookies(res, refreshed);
  return res;
}
