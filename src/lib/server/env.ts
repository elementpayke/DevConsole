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

/** Base JSON-RPC for merchant USDC balance reads (server-only). */
export function getBaseRpcUrl(): string {
  const url = process.env.BASE_RPC_URL?.trim();
  if (url) return url;
  return "https://mainnet.base.org";
}

export type OAuthClientConfig = { clientId: string; clientSecret: string };

/** Null (not throw) when unset — lets the /start route 503 cleanly instead of crashing. */
export function getGithubOAuthConfig(): OAuthClientConfig | null {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function getGoogleOAuthConfig(): OAuthClientConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}
