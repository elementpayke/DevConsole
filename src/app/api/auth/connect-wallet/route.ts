import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import {
  isValidEvmAddress,
  MERCHANT_TREASURY_CHAIN,
} from "@/lib/merchantWallet";
import {
  requireMerchantSession,
  withRefreshedCookies,
} from "@/lib/server/merchantRoute";

export async function POST(req: NextRequest) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  const ctx = await requireMerchantSession();
  if (ctx instanceof NextResponse) return ctx;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const address =
    typeof record.address === "string" ? record.address.trim() : "";
  const chain =
    typeof record.chain === "string" && record.chain.trim()
      ? record.chain.trim().toLowerCase()
      : MERCHANT_TREASURY_CHAIN;

  if (!isValidEvmAddress(address)) {
    return NextResponse.json(
      { message: "A valid 0x EVM address is required" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetchAggregator("/auth/connect-wallet", {
      method: "POST",
      accessToken: ctx.accessToken,
      body: { address, chain },
    });
    return withRefreshedCookies(
      await nextResponseFromUpstream(upstream),
      ctx.refreshed,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
