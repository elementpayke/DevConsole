/** Server-only aggregator env. Never import from client components. */

export function getAggregatorBaseUrl(): string {
  const base = process.env.AGGREGATOR_BASE_URL ?? "http://localhost:8000/api/v1";
  return base.replace(/\/$/, "");
}

export function getFeClientSecret(): string {
  const secret = process.env.FE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("FE_CLIENT_SECRET is not configured");
  }
  return secret;
}

/** EP partner API key for console Off-ramp (server-only). */
export function getConsolePartnerApiKey(): string {
  const key = process.env.CONSOLE_PARTNER_API_KEY;
  if (!key) {
    throw new Error("CONSOLE_PARTNER_API_KEY is not configured");
  }
  return key;
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Self-serve merchant register + onboarding BFF (default off until Phase B ready). */
export function isMerchantSignupEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MERCHANT_SIGNUP_ENABLED === "true";
}
