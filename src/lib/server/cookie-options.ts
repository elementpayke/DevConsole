import { isProductionRuntime } from "./env";

export const ACCESS_COOKIE = "ep_access_token";
export const REFRESH_COOKIE = "ep_refresh_token";

const ACCESS_MAX_AGE_SEC = 60 * 60; // 1 hour
const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type CookiePersistence = "session" | "persistent";

export function authCookieOptions(maxAge?: number) {
  return {
    httpOnly: true as const,
    secure: isProductionRuntime(),
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function accessTokenCookieMaxAge(): number {
  return ACCESS_MAX_AGE_SEC;
}

export function refreshTokenCookieMaxAge(persistence: CookiePersistence): number | undefined {
  return persistence === "persistent" ? REFRESH_MAX_AGE_SEC : undefined;
}
