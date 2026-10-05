import { NextRequest, NextResponse } from "next/server";
import { fetchAggregator, misconfiguredSecretResponse } from "@/lib/server/aggregator";
import { setAuthCookies } from "@/lib/server/cookies";
import { exchangeGithubCode } from "@/lib/server/oauth/github";
import { exchangeGoogleCode } from "@/lib/server/oauth/google";
import { isOAuthProvider } from "@/lib/server/oauth/types";
import type { AuthTokens, User } from "@/lib/types";

function oauthStateCookieName(provider: string) {
  return `oauth_state_${provider}`;
}

function errorRedirect(origin: string, reason: string) {
  const res = NextResponse.redirect(new URL(`/login?oauth_error=${reason}`, origin));
  return res;
}

function isAuthTokens(value: unknown): value is AuthTokens {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.access_token === "string" && typeof v.refresh_token === "string";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const origin = req.nextUrl.origin;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ message: "Unknown OAuth provider" }, { status: 404 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieName = oauthStateCookieName(provider);
  const cookieValue = req.cookies.get(cookieName)?.value ?? "";
  const [expectedState, role] = cookieValue.split(":");

  if (!code || !state || !expectedState || state !== expectedState) {
    const res = errorRedirect(origin, "state_mismatch");
    res.cookies.delete(cookieName);
    return res;
  }

  const redirectUri = new URL(`/api/auth/oauth/${provider}/callback`, origin).toString();
  const identity =
    provider === "github"
      ? await exchangeGithubCode(code, redirectUri)
      : await exchangeGoogleCode(code, redirectUri);

  if (!identity) {
    const res = errorRedirect(origin, "exchange_failed");
    res.cookies.delete(cookieName);
    return res;
  }

  let upstream: Response;
  try {
    upstream = await fetchAggregator("/auth/oauth/callback", {
      method: "POST",
      body: {
        provider,
        subject: identity.subject,
        email: identity.email,
        name: identity.name,
        role: role === "merchant" ? "merchant" : "user",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    const res = errorRedirect(origin, "aggregator_unreachable");
    res.cookies.delete(cookieName);
    return res;
  }

  const text = await upstream.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!upstream.ok || !isAuthTokens(json)) {
    const res = errorRedirect(origin, "login_failed");
    res.cookies.delete(cookieName);
    return res;
  }

  let user: User | null = null;
  try {
    const meRes = await fetchAggregator("/auth/me", { accessToken: json.access_token });
    if (meRes.ok) user = (await meRes.json()) as User;
  } catch {
    user = null;
  }

  const destination = user?.partner_customer_id ? "/dashboard" : "/onboarding";
  const res = NextResponse.redirect(new URL(destination, origin));
  setAuthCookies(res, json, "persistent");
  res.cookies.delete(cookieName);
  return res;
}
