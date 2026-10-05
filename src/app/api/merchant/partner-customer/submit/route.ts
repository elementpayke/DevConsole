import { NextRequest, NextResponse } from "next/server";
import { assertTrustedOrigin, nextResponseFromUpstream } from "@/lib/server/aggregator";
import { partnerFetch } from "@/lib/server/partnerApi";
import { requireMerchantSession, withRefreshedCookies } from "@/lib/server/merchantRoute";

/**
 * Submit the merchant's KYB case for review (incomplete → pending_review).
 * Forwards the aggregator's 422 {code,missing[]} body as-is on an incomplete package.
 */
export async function POST(req: NextRequest) {
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

  const upstream = await partnerFetch(`customers/${customerId}/submit`, { method: "POST" });
  return withRefreshedCookies(await nextResponseFromUpstream(upstream), ctx.refreshed);
}
