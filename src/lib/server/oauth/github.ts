import { getGithubOAuthConfig } from "@/lib/server/env";
import type { VerifiedOAuthIdentity } from "./types";

export function githubAuthorizeUrl(redirectUri: string, state: string): string | null {
  const config = getGithubOAuthConfig();
  if (!config) return null;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

type GithubEmail = { email: string; primary: boolean; verified: boolean };

/** Exchanges the authorization code and returns a verified identity, or null on any failure. */
export async function exchangeGithubCode(
  code: string,
  redirectUri: string,
): Promise<VerifiedOAuthIdentity | null> {
  const config = getGithubOAuthConfig();
  if (!config) return null;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) return null;

  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) return null;
  const user = (await userRes.json()) as { id?: number; login?: string; name?: string; email?: string | null };
  if (!user.id) return null;

  let email = user.email ?? null;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as GithubEmail[];
      const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
      email = primary?.email ?? null;
    }
  }
  if (!email) return null;

  return { subject: String(user.id), email, name: user.name ?? user.login };
}
