import { apiFetch } from "@/lib/api/client";

export type CollectProfile = {
  id: number;
  slug: string;
  display_name: string;
  legal_name: string | null;
  kind: string;
  partner_customer_id: string | null;
  is_active: boolean;
  public_path: string;
  allow_mpesa: boolean;
  allow_cards: boolean;
  allow_stable: boolean;
  /** Solo owner or chosen company director — KYC + settlement subject. */
  kyc_subject_user_id?: number | null;
  kyc_subject_role?: string | null;
  kyc_verified?: boolean;
  /** Stellar USDC home + customer-paid bridge contract. */
  settlement?: {
    home_asset?: string;
    home_network?: string;
    bridge_fee_payer?: string;
    merchant_receives?: string;
    home_ready?: boolean;
    notes?: string;
  } | null;
  accepts?: string[];
  source_chains?: Array<{ chain: string; label?: string; asset?: string }>;
};

export type PaymentLink = {
  id: number;
  link_slug: string;
  title: string;
  amount: number;
  currency: string;
  kind: string;
  status: string;
  paid_count: number;
  public_path: string;
  client_email: string | null;
};

export type PaybillReference = {
  id: number;
  account_number: string;
  label: string;
  type: string;
  is_active: boolean;
};

/** Apex vanity host for public collect URLs (override in env later if needed). */
export function publicCollectOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_COLLECT_ORIGIN?.trim();
  const origin = raw || "https://elementpay.net";
  return origin.replace(/\/$/, "");
}

export function absoluteCollectUrl(publicPath: string): string {
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${publicCollectOrigin()}${path}`;
}

export async function getMyCollectProfile(): Promise<CollectProfile | null> {
  try {
    return await apiFetch<CollectProfile>("businesses/me");
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 404) return null;
    throw err;
  }
}

export async function createCollectProfile(body: {
  slug: string;
  display_name: string;
  kind: "solo" | "company";
  legal_name?: string;
}): Promise<CollectProfile> {
  return apiFetch<CollectProfile>("businesses", { method: "POST", body });
}

export async function listPaymentLinks(): Promise<PaymentLink[]> {
  return apiFetch<PaymentLink[]>("businesses/me/payment-requests");
}

export async function createPaymentLink(body: {
  title: string;
  amount: number;
  currency?: string;
  kind?: "one_time" | "reusable";
  link_slug?: string;
  client_email?: string;
}): Promise<PaymentLink> {
  return apiFetch<PaymentLink>("businesses/me/payment-requests", { method: "POST", body });
}

export async function updateCheckoutMethods(body: {
  allow_mpesa: boolean;
  allow_cards: boolean;
  allow_stable: boolean;
}): Promise<CollectProfile> {
  return apiFetch<CollectProfile>("businesses/me/checkout-methods", { method: "PATCH", body });
}

export async function listPaybillReferences(): Promise<PaybillReference[]> {
  return apiFetch<PaybillReference[]>("businesses/me/paybill-references");
}

export async function createPaybillReference(body: {
  label: string;
  type?: "reusable" | "one_time";
  account_number?: string;
}): Promise<PaybillReference> {
  return apiFetch<PaybillReference>("businesses/me/paybill-references", { method: "POST", body });
}

export async function listEmbedDomains(): Promise<string[]> {
  return apiFetch<string[]>("businesses/me/embed-domains");
}

export async function addEmbedDomain(domain: string): Promise<string[]> {
  return apiFetch<string[]>("businesses/me/embed-domains", { method: "POST", body: { domain } });
}

export async function createRefundRequest(body: {
  order_id: string;
  reason?: string;
}): Promise<{ id: number; order_id: string; status: string; message: string }> {
  return apiFetch("users/me/refund-requests", { method: "POST", body });
}
