import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canSubmitWithTurnstile,
  getTurnstileSiteKey,
  isTurnstileConfigured,
  withTurnstileToken,
} from "../src/lib/turnstile";

const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

describe("turnstile helpers", () => {
  it("treats missing site key as not configured", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "";
    assert.equal(getTurnstileSiteKey(), "");
    assert.equal(isTurnstileConfigured(), false);
    assert.equal(
      canSubmitWithTurnstile(false, null),
      true,
      "unset site key preserves submit without a token",
    );
  });

  it("requires a non-empty token when configured", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "  site-key-abc  ";
    assert.equal(getTurnstileSiteKey(), "site-key-abc");
    assert.equal(isTurnstileConfigured(), true);
    assert.equal(canSubmitWithTurnstile(true, null), false);
    assert.equal(canSubmitWithTurnstile(true, "   "), false);
    assert.equal(canSubmitWithTurnstile(true, "tok_123"), true);
  });

  it("omits turnstile_token from body when unset", () => {
    assert.deepEqual(withTurnstileToken({ email: "a@b.co", password: "x" }), {
      email: "a@b.co",
      password: "x",
    });
    assert.deepEqual(withTurnstileToken({ email: "a@b.co" }, null), {
      email: "a@b.co",
    });
    assert.deepEqual(withTurnstileToken({ email: "a@b.co" }, "  "), {
      email: "a@b.co",
    });
  });

  it("attaches trimmed turnstile_token when present", () => {
    assert.deepEqual(withTurnstileToken({ email: "a@b.co", password: "x" }, " tok_abc "), {
      email: "a@b.co",
      password: "x",
      turnstile_token: "tok_abc",
    });
  });

  it("cleared token blocks resubmit until widget refreshes", () => {
    let token: string | null = "fresh-token";
    assert.equal(canSubmitWithTurnstile(true, token), true);
    token = null;
    assert.equal(canSubmitWithTurnstile(true, token), false);
  });
});

if (originalSiteKey === undefined) {
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
} else {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
}
