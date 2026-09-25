import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import { refreshTokens } from "@/lib/server/session";
import {
  requireMerchantSession,
  withRefreshedCookies,
} from "@/lib/server/merchantRoute";

/**
 * Mint RS256 JWT for Privy custom auth from the Console HTTP-only session.
 */

export async function POST(req: NextRequest) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  const merchant = await requireMerchantSession();
  if (merchant instanceof NextResponse) return merchant;

  let accessToken = merchant.accessToken;
  let refreshed = merchant.refreshed;

  try {
    let upstream = await fetchAggregator("/auth/privy/token", {
      method: "POST",
      accessToken,
    });

    if (upstream.status === 401) {
      const next = await refreshTokens();
      if (!next) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      refreshed = next;
      accessToken = next.access_token;
      upstream = await fetchAggregator("/auth/privy/token", {
        method: "POST",
        accessToken,
      });
    }

    if (!upstream.ok) {
      return nextResponseFromUpstream(upstream);
    }

    const json = (await upstream.json()) as { token?: string; data?: { token?: string } };
    const token = json.token ?? json.data?.token;
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Account setup is temporarily unavailable." },
        { status: 502 },
      );
    }

    return withRefreshedCookies(
      NextResponse.json({ token }),
      refreshed,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
