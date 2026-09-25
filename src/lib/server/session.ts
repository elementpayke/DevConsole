import {
  fetchAggregator,
} from "@/lib/server/aggregator";
import {
  readAccessToken,
  readRefreshToken,
} from "@/lib/server/cookies";
import type { AuthTokens, User } from "@/lib/types";

export type ResolvedSession = {
  accessToken: string;
  refreshed: AuthTokens | null;
};

/** Refresh and return a usable access token for BFF aggregator calls. */
export async function resolveSessionAccessToken(): Promise<ResolvedSession | null> {
  let access = await readAccessToken();
  let refreshed: AuthTokens | null = null;

  if (!access) {
    refreshed = await refreshTokens();
    if (!refreshed) return null;
    access = refreshed.access_token;
  }

  return { accessToken: access, refreshed };
}

export async function refreshTokens(): Promise<AuthTokens | null> {
  const refresh = await readRefreshToken();
  if (!refresh) return null;

  const upstream = await fetchAggregator("/auth/token/refresh", {
    method: "POST",
    body: { refresh_token: refresh },
  });
  if (!upstream.ok) return null;

  const json = (await upstream.json()) as Partial<AuthTokens> & {
    data?: Partial<AuthTokens>;
  };
  const access =
    typeof json.access_token === "string"
      ? json.access_token
      : typeof json.data?.access_token === "string"
        ? json.data.access_token
        : null;
  const nextRefresh =
    typeof json.refresh_token === "string"
      ? json.refresh_token
      : typeof json.data?.refresh_token === "string"
        ? json.data.refresh_token
        : null;
  if (!access || !nextRefresh) return null;

  return {
    access_token: access,
    refresh_token: nextRefresh,
    token_type:
      typeof json.token_type === "string"
        ? json.token_type
        : typeof json.data?.token_type === "string"
          ? json.data.token_type
          : "bearer",
  };
}

export async function fetchMe(accessToken: string): Promise<User | null> {
  const meRes = await fetchAggregator("/auth/me", { accessToken });
  if (!meRes.ok) return null;
  const json = (await meRes.json()) as User | { data?: User };
  if (json && typeof json === "object" && "data" in json && json.data) {
    return json.data as User;
  }
  return json as User;
}
