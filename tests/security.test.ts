import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeProxyPath } from "../src/lib/server/proxy-path";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
} from "../src/lib/server/cookie-options";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("sanitizeProxyPath", () => {
  it("joins valid segments", () => {
    assert.equal(sanitizeProxyPath(["auth", "login"]), "auth/login");
    assert.equal(sanitizeProxyPath(["users", "me", "dashboard"]), "users/me/dashboard");
  });

  it("rejects empty path", () => {
    assert.throws(() => sanitizeProxyPath([]), /Missing proxy path/);
  });

  it("rejects traversal segments", () => {
    assert.throws(() => sanitizeProxyPath(["..", "etc"]), /Invalid proxy path/);
    assert.throws(() => sanitizeProxyPath(["auth", ".."]), /Invalid proxy path/);
    assert.throws(() => sanitizeProxyPath(["."]), /Invalid proxy path/);
  });

  it("rejects embedded separators", () => {
    assert.throws(() => sanitizeProxyPath(["auth/login"]), /Invalid proxy path/);
    assert.throws(() => sanitizeProxyPath(["auth\\login"]), /Invalid proxy path/);
  });
});

describe("auth cookies", () => {
  it("uses httpOnly + sameSite lax", () => {
    const opts = authCookieOptions(3600);
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.sameSite, "lax");
    assert.equal(opts.path, "/");
    assert.equal(opts.maxAge, 3600);
  });

  it("omits maxAge for session cookies", () => {
    const opts = authCookieOptions(undefined);
    assert.equal("maxAge" in opts, false);
  });

  it("uses expected cookie names", () => {
    assert.equal(ACCESS_COOKIE, "ep_access_token");
    assert.equal(REFRESH_COOKIE, "ep_refresh_token");
  });
});

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, acc);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) acc.push(full);
  }
  return acc;
}

describe("secret exposure guards", () => {
  it("never references NEXT_PUBLIC_FE_CLIENT_SECRET", () => {
    const files = walkFiles(join(root, "src"));
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.equal(
        text.includes("NEXT_PUBLIC_FE_CLIENT_SECRET"),
        false,
        `${file} must not reference NEXT_PUBLIC_FE_CLIENT_SECRET`,
      );
    }
  });

  it("client api modules do not import server env or FE_CLIENT_SECRET", () => {
    const clientRoots = [
      join(root, "src/lib/api"),
      join(root, "src/lib/auth"),
      join(root, "src/app/(auth)"),
      join(root, "src/app/(console)"),
      join(root, "src/components"),
    ];
    for (const dir of clientRoots) {
      for (const file of walkFiles(dir)) {
        const text = readFileSync(file, "utf8");
        assert.equal(
          text.includes("FE_CLIENT_SECRET"),
          false,
          `${file} must not reference FE_CLIENT_SECRET`,
        );
        assert.equal(
          text.includes("@/lib/server/"),
          false,
          `${file} must not import server-only modules`,
        );
      }
    }
  });

  it("client fetch wrapper uses credentials and no localStorage tokens", () => {
    const client = readFileSync(join(root, "src/lib/api/client.ts"), "utf8");
    assert.match(client, /credentials:\s*["']include["']/);
    assert.doesNotMatch(client, /localStorage/);
    assert.doesNotMatch(client, /access_token/);
    assert.doesNotMatch(client, /NEXT_PUBLIC_API_BASE_URL/);
  });

  it("AuthContext does not persist JWTs to localStorage", () => {
    const auth = readFileSync(join(root, "src/lib/auth/AuthContext.tsx"), "utf8");
    assert.match(auth, /removeItem\(LEGACY_STORAGE_KEY\)/);
    assert.doesNotMatch(auth, /setItem\(.*auth/);
    assert.doesNotMatch(auth, /access_token/);
    assert.doesNotMatch(auth, /refresh_token/);
  });

  it("proxy only sets FE secret from env, never from request headers", () => {
    const proxy = readFileSync(join(root, "src/app/api/proxy/[...path]/route.ts"), "utf8");
    assert.match(proxy, /X-FE-Client-Secret/);
    assert.match(proxy, /getFeClientSecret/);
    assert.doesNotMatch(proxy, /headers\.get\(["']x-fe-client-secret["']\)/i);
  });

  it("env example documents server-only secret without NEXT_PUBLIC prefix", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    assert.match(example, /^FE_CLIENT_SECRET=/m);
    assert.match(example, /^AGGREGATOR_BASE_URL=/m);
    assert.match(example, /^NEXT_PUBLIC_TURNSTILE_SITE_KEY=/m);
    assert.doesNotMatch(example, /^NEXT_PUBLIC_FE_CLIENT_SECRET=/m);
    assert.doesNotMatch(example, /^NEXT_PUBLIC_API_BASE_URL=/m);
    assert.doesNotMatch(example, /^TURNSTILE_SECRET_KEY=/m);
  });

  it("login BFF forwards turnstile_token to aggregator", () => {
    const login = readFileSync(join(root, "src/app/api/auth/login/route.ts"), "utf8");
    assert.match(login, /turnstile_token/);
    assert.match(login, /loginBody/);
  });
});

describe("assertTrustedOrigin (source contract)", () => {
  it("rejects cross-site Origin in production path", () => {
    const src = readFileSync(join(root, "src/lib/server/aggregator.ts"), "utf8");
    assert.match(src, /Origin not allowed/);
    assert.match(src, /parsed\.host !== host/);
    assert.match(src, /Missing Origin/);
  });
});
