import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveUserWithTokenRefresh } from "../src/lib/server/merchantRoute";
import type { AuthTokens, User } from "../src/lib/types";

const merchantUser: User = {
  id: 1,
  email: "m@example.com",
  role: "merchant",
  is_active: true,
  kyc_verified: true,
  partner_customer_id: "pcus_test",
  created_at: "2026-01-01T00:00:00Z",
};

const developerUser: User = {
  ...merchantUser,
  id: 2,
  email: "d@example.com",
  role: "developer",
  partner_customer_id: null,
};

const tokens: AuthTokens = {
  access_token: "access-new",
  refresh_token: "refresh-new",
  token_type: "bearer",
};

describe("resolveUserWithTokenRefresh", () => {
  it("returns the user on the first successful /auth/me", async () => {
    let refreshCalls = 0;
    const result = await resolveUserWithTokenRefresh("access-old", null, {
      fetchMe: async (token) => (token === "access-old" ? merchantUser : null),
      refreshTokens: async () => {
        refreshCalls += 1;
        return tokens;
      },
    });
    assert.deepEqual(result, {
      user: merchantUser,
      accessToken: "access-old",
      refreshed: null,
    });
    assert.equal(refreshCalls, 0);
  });

  it("preserves an existing refreshed token bundle when /auth/me succeeds immediately", async () => {
    const prior: AuthTokens = {
      access_token: "access-from-cookie-refresh",
      refresh_token: "refresh-prior",
      token_type: "bearer",
    };
    const result = await resolveUserWithTokenRefresh(prior.access_token, prior, {
      fetchMe: async () => merchantUser,
      refreshTokens: async () => tokens,
    });
    assert.equal(result?.accessToken, prior.access_token);
    assert.equal(result?.refreshed, prior);
  });

  it("refreshes once when the first /auth/me fails", async () => {
    const seen: string[] = [];
    const result = await resolveUserWithTokenRefresh("stale", null, {
      fetchMe: async (token) => {
        seen.push(token);
        return token === "access-new" ? merchantUser : null;
      },
      refreshTokens: async () => tokens,
    });
    assert.deepEqual(seen, ["stale", "access-new"]);
    assert.deepEqual(result, {
      user: merchantUser,
      accessToken: "access-new",
      refreshed: tokens,
    });
  });

  it("returns null when refresh fails after /auth/me fails", async () => {
    const result = await resolveUserWithTokenRefresh("stale", null, {
      fetchMe: async () => null,
      refreshTokens: async () => null,
    });
    assert.equal(result, null);
  });

  it("returns null when /auth/me still fails after a successful refresh", async () => {
    const result = await resolveUserWithTokenRefresh("stale", null, {
      fetchMe: async () => null,
      refreshTokens: async () => tokens,
    });
    assert.equal(result, null);
  });

  it("does not call refresh when the first /auth/me succeeds", async () => {
    let refreshCalls = 0;
    await resolveUserWithTokenRefresh("ok", null, {
      fetchMe: async () => developerUser,
      refreshTokens: async () => {
        refreshCalls += 1;
        return tokens;
      },
    });
    assert.equal(refreshCalls, 0);
  });
});
