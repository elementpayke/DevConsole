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

export async function requireMerchantSession(): Promise<
  MerchantSessionContext | NextResponse
> {
  const session = await resolveSessionAccessToken();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let accessToken = session.accessToken;
  let refreshed = session.refreshed;
  let user = await fetchMe(accessToken);
  if (!user) {
    const next = await refreshTokens();
    if (!next) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    refreshed = next;
    accessToken = next.access_token;
    user = await fetchMe(accessToken);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }
  if (user.role !== "merchant") {
    return NextResponse.json(
      { message: "Merchant access only" },
      { status: 403 },
    );
  }

  return {
    user,
    accessToken,
    refreshed,
  };
}

export function withRefreshedCookies(
  res: NextResponse,
  refreshed: AuthTokens | null,
): NextResponse {
  if (refreshed) setAuthCookies(res, refreshed);
  return res;
}
