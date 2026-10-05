import { getGoogleOAuthConfig } from "@/lib/server/env";
import type { VerifiedOAuthIdentity } from "./types";

export function googleAuthorizeUrl(redirectUri: string, state: string): string | null {
  const config = getGoogleOAuthConfig();
  if (!config) return null;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  return url.toString();
}

/** Exchanges the authorization code and returns a verified identity, or null on any failure. */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<VerifiedOAuthIdentity | null> {
  const config = getGoogleOAuthConfig();
  if (!config) return null;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) return null;

  // Access-token-backed userinfo call — avoids needing to verify the id_token's JWT signature locally.
  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) return null;
  const user = (await userRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  if (!user.sub || !user.email || !user.email_verified) return null;

  return { subject: user.sub, email: user.email, name: user.name };
}
