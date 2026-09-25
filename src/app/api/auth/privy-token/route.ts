import { NextResponse } from "next/server";
import {
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import {
  refreshTokens,
  resolveSessionAccessToken,
} from "@/lib/server/session";
import { withRefreshedCookies } from "@/lib/server/merchantRoute";

/**
 * Mint RS256 JWT for Privy custom auth from the Console HTTP-only session.
 */

export async function POST() {
  let session = await resolveSessionAccessToken();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let upstream = await fetchAggregator("/auth/privy/token", {
      method: "POST",
      accessToken: session.accessToken,
    });

    if (upstream.status === 401) {
      const refreshed = await refreshTokens();
      if (!refreshed) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      session = { accessToken: refreshed.access_token, refreshed };
      upstream = await fetchAggregator("/auth/privy/token", {
        method: "POST",
        accessToken: session.accessToken,
      });
    }

    if (!upstream.ok) {
      return nextResponseFromUpstream(upstream);
    }

    const json = (await upstream.json()) as { token?: string; data?: { token?: string } };
    const token = json.token ?? json.data?.token;
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Invalid Privy token response" },
        { status: 502 },
      );
    }

    return withRefreshedCookies(
      NextResponse.json({ token }),
      session.refreshed,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
