import { NextRequest, NextResponse } from "next/server";
import { assertTrustedOrigin, nextResponseFromUpstream } from "@/lib/server/aggregator";
import { partnerFetch } from "@/lib/server/partnerApi";
import { requireMerchantSession, withRefreshedCookies } from "@/lib/server/merchantRoute";

/** Merchant's own KYB vault case: GET to read status/profile, PATCH to update profile. */

export async function GET() {
  const ctx = await requireMerchantSession();
  if (ctx instanceof NextResponse) return ctx;

  const customerId = ctx.user.partner_customer_id;
  if (!customerId) {
    return withRefreshedCookies(
      NextResponse.json({ message: "No business profile yet" }, { status: 404 }),
      ctx.refreshed,
    );
  }

  const upstream = await partnerFetch(`customers/${customerId}`);
  return withRefreshedCookies(await nextResponseFromUpstream(upstream), ctx.refreshed);
}

export async function PATCH(req: NextRequest) {
  const originError = assertTrustedOrigin(req);
  if (originError) return originError;

  const ctx = await requireMerchantSession();
  if (ctx instanceof NextResponse) return ctx;

  const customerId = ctx.user.partner_customer_id;
  if (!customerId) {
    return withRefreshedCookies(
      NextResponse.json({ message: "No business profile yet" }, { status: 404 }),
      ctx.refreshed,
    );
  }

  let body: { profile?: Record<string, unknown> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.profile || typeof body.profile !== "object") {
    return NextResponse.json({ message: "profile is required" }, { status: 400 });
  }

  const upstream = await partnerFetch(`customers/${customerId}`, {
    method: "PATCH",
    body: { profile: body.profile },
  });
  return withRefreshedCookies(await nextResponseFromUpstream(upstream), ctx.refreshed);
}
