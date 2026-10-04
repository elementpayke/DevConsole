import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PRIMARY_CONSOLE_NAV, primaryNavForRole } from "../src/lib/consoleNav";

describe("primaryNavForRole", () => {
  it("shows the same primary routes for developer and merchant", () => {
    assert.deepEqual(primaryNavForRole("developer"), [...PRIMARY_CONSOLE_NAV]);
    assert.deepEqual(primaryNavForRole("merchant"), [...PRIMARY_CONSOLE_NAV]);
  });

  it("includes API Keys and Wallets for every role", () => {
    const nav = primaryNavForRole("merchant");
    assert.ok(nav.includes("/api-keys"));
    assert.ok(nav.includes("/wallets"));
    assert.ok(nav.includes("/reference"));
  });
});
