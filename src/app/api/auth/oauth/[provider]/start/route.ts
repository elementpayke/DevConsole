import { NextRequest, NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/server/env";
import { githubAuthorizeUrl } from "@/lib/server/oauth/github";
import { googleAuthorizeUrl } from "@/lib/server/oauth/google";
import { isOAuthProvider } from "@/lib/server/oauth/types";

function oauthStateCookieName(provider: string) {
  return `oauth_state_${provider}`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ message: "Unknown OAuth provider" }, { status: 404 });
  }

  const role = req.nextUrl.searchParams.get("role") === "merchant" ? "merchant" : "user";
  const state = crypto.randomUUID();
  const redirectUri = new URL(`/api/auth/oauth/${provider}/callback`, req.nextUrl.origin).toString();

  const authorizeUrl =
    provider === "github" ? githubAuthorizeUrl(redirectUri, state) : googleAuthorizeUrl(redirectUri, state);
  if (!authorizeUrl) {
    return NextResponse.json(
      { message: `${provider === "github" ? "GitHub" : "Google"} sign-in isn't configured yet.` },
      { status: 503 },
    );
  }

  const res = NextResponse.redirect(authorizeUrl);
  // Encodes the signup role alongside the CSRF state — read back and verified in the callback.
  res.cookies.set(oauthStateCookieName(provider), `${state}:${role}`, {
    httpOnly: true,
    secure: isProductionRuntime(),
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
