/** Client-safe gate for self-serve merchant registration (default off). */
export function isMerchantSignupEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MERCHANT_SIGNUP_ENABLED === "true";
}
