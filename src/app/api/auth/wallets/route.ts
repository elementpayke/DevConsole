import { NextResponse } from "next/server";
import {
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import {
  requireMerchantSession,
  withRefreshedCookies,
} from "@/lib/server/merchantRoute";
import { unwrapLinkedWalletsFromApi } from "@/lib/merchantWallet";

export async function GET() {
  const ctx = await requireMerchantSession();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const upstream = await fetchAggregator("/auth/wallets", {
      accessToken: ctx.accessToken,
    });
    if (!upstream.ok) {
      return withRefreshedCookies(
        await nextResponseFromUpstream(upstream),
        ctx.refreshed,
      );
    }
    const json = await upstream.json();
    return withRefreshedCookies(
      NextResponse.json({ data: unwrapLinkedWalletsFromApi(json) }),
      ctx.refreshed,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
