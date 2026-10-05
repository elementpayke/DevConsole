import { apiFetch, ApiError } from "./client";
import type { PartnerCustomer } from "@/lib/types";

const PATH = "/api/merchant/partner-customer";

/** Null when the merchant hasn't started a business profile yet (404). */
export async function getPartnerCustomer(): Promise<PartnerCustomer | null> {
  try {
    return await apiFetch<PartnerCustomer>(PATH, { absolutePath: PATH });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function updatePartnerCustomerProfile(
  profile: Record<string, unknown>,
): Promise<PartnerCustomer> {
  return apiFetch<PartnerCustomer>(PATH, {
    method: "PATCH",
    body: { profile },
    absolutePath: PATH,
  });
}

export class PartnerCustomerIncompleteError extends Error {
  missing: string[];
  constructor(missing: string[]) {
    super("Customer package is incomplete");
    this.name = "PartnerCustomerIncompleteError";
    this.missing = missing;
  }
}

/** Submits for review. Throws PartnerCustomerIncompleteError (with missing[]) on 422. */
export async function submitPartnerCustomer(): Promise<PartnerCustomer> {
  try {
    return await apiFetch<PartnerCustomer>(`${PATH}/submit`, {
      method: "POST",
      absolutePath: `${PATH}/submit`,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) {
      const missing =
        (err.data as { data?: { missing?: string[] } } | undefined)?.data?.missing ?? [];
      throw new PartnerCustomerIncompleteError(missing);
    }
    throw err;
  }
}
