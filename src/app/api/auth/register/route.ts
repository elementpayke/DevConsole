import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import { isMerchantSignupEnabled } from "@/lib/server/env";

export async function POST(req: NextRequest) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = { ...(body as Record<string, unknown>) };
    const role = record.role;
    if (role === "merchant" && !isMerchantSignupEnabled()) {
      return NextResponse.json(
        { message: "Merchant signup is not open yet. Register as a developer or contact ElementPay." },
        { status: 403 },
      );
    }
    body = record;
  }

  try {
    const upstream = await fetchAggregator("/auth/register", {
      method: "POST",
      body,
    });
    return nextResponseFromUpstream(upstream);
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
