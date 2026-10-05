import { apiFetch } from "./client";
import type { PayoutDestination } from "@/lib/types";

const PATH = "/api/merchant/payout-destination";

export function updatePayoutDestination(
  body: PayoutDestination,
): Promise<PayoutDestination> {
  return apiFetch<PayoutDestination>(PATH, { method: "PATCH", body, absolutePath: PATH });
}
