/**
 * Cloudflare Turnstile helpers (browser).
 * Site key is public; secret stays on the aggregator.
 */

export const getTurnstileSiteKey = (): string =>
  (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();

export const isTurnstileConfigured = (): boolean =>
  Boolean(getTurnstileSiteKey());

/** True when captcha is not required, or a non-empty token is present. */
export const canSubmitWithTurnstile = (
  turnstileConfigured: boolean,
  turnstileToken: string | null | undefined,
): boolean => {
  if (!turnstileConfigured) return true;
  return Boolean((turnstileToken ?? "").trim());
};

/** Attach turnstile_token when present; omit when unset (FE ships before aggregator flips REQUIRED). */
export function withTurnstileToken<T extends Record<string, unknown>>(
  body: T,
  turnstileToken?: string | null,
): T & { turnstile_token?: string } {
  const token = (turnstileToken ?? "").trim();
  return token ? { ...body, turnstile_token: token } : { ...body };
}
