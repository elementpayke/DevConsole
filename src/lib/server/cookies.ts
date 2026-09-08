import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessTokenCookieMaxAge,
  authCookieOptions,
  refreshTokenCookieMaxAge,
  type CookiePersistence,
} from "./cookie-options";

export {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  type CookiePersistence,
} from "./cookie-options";

export function setAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token: string },
  persistence: CookiePersistence = "persistent",
) {
  res.cookies.set(
    ACCESS_COOKIE,
    tokens.access_token,
    authCookieOptions(accessTokenCookieMaxAge()),
  );
  res.cookies.set(
    REFRESH_COOKIE,
    tokens.refresh_token,
    authCookieOptions(refreshTokenCookieMaxAge(persistence)),
  );
}

export function clearAuthCookies(res: NextResponse) {
  const cleared = { ...authCookieOptions(0), maxAge: 0 };
  res.cookies.set(ACCESS_COOKIE, "", cleared);
  res.cookies.set(REFRESH_COOKIE, "", cleared);
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}
