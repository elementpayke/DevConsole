import { NextResponse } from "next/server";
import {
  fetchAggregator,
  misconfiguredSecretResponse,
} from "@/lib/server/aggregator";
import {
  requireMerchantSession,
  withRefreshedCookies,
} from "@/lib/server/merchantRoute";
import {
  selectMerchantTreasuryWallet,
  unwrapLinkedWalletsFromApi,
} from "@/lib/merchantWallet";
import { fetchUsdcBalanceOnBase } from "@/lib/server/usdcBaseBalance";
import { getBaseRpcUrl } from "@/lib/server/env";

export async function GET() {
  const ctx = await requireMerchantSession();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const upstream = await fetchAggregator("/auth/wallets", {
      accessToken: ctx.accessToken,
    });
    if (!upstream.ok) {
      return withRefreshedCookies(
        NextResponse.json(
          { message: "Could not load payment account" },
          { status: upstream.status },
        ),
        ctx.refreshed,
      );
    }
    const json = await upstream.json();
    const wallet = selectMerchantTreasuryWallet(unwrapLinkedWalletsFromApi(json));
    if (!wallet?.address) {
      return withRefreshedCookies(
        NextResponse.json({
          data: { balance_usdc: null, currency: "USDC", has_account: false },
        }),
        ctx.refreshed,
      );
    }

    const balance = await fetchUsdcBalanceOnBase(wallet.address, getBaseRpcUrl());
    return withRefreshedCookies(
      NextResponse.json({
        data: {
          balance_usdc: balance,
          currency: "USDC",
          has_account: true,
        },
      }),
      ctx.refreshed,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Balance lookup failed" }, { status: 502 });
  }
}
