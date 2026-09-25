import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/server/cookies";
import { fetchMe, resolveSessionAccessToken } from "@/lib/server/session";
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

  const user = await fetchMe(session.accessToken);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "merchant") {
    return NextResponse.json(
      { message: "Merchant access only" },
      { status: 403 },
    );
  }

  return {
    user,
    accessToken: session.accessToken,
    refreshed: session.refreshed,
  };
}

export function withRefreshedCookies(
  res: NextResponse,
  refreshed: AuthTokens | null,
): NextResponse {
  if (refreshed) setAuthCookies(res, refreshed);
  return res;
}
