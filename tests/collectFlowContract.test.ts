import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { absoluteCollectUrl, publicCollectOrigin } from "../src/lib/api/collect";

/**
 * Contract for Console → vanity URL → checkout open path (no live network).
 * Mirrors PR-Q2 create-link → copy → open checkout without staging credentials.
 */
describe("collect link → checkout open contract", () => {
  it("builds shareable payment-link URLs checkout can serve", () => {
    const publicPath = "/acme-studio/l/pay-ab12cd";
    const url = absoluteCollectUrl(publicPath);
    assert.equal(url, `${publicCollectOrigin()}${publicPath}`);
    const parsed = new URL(url);
    assert.match(parsed.pathname, /^\/[a-z0-9-]+\/l\/[a-z0-9-]+$/);
  });

  it("builds merchant storefront URLs", () => {
    const url = absoluteCollectUrl("/acme-studio");
    assert.equal(new URL(url).pathname, "/acme-studio");
  });
});
