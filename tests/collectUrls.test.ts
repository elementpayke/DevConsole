import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { absoluteCollectUrl, publicCollectOrigin } from "../src/lib/api/collect";

describe("collect public URLs", () => {
  it("builds absolute vanity paths", () => {
    const origin = publicCollectOrigin();
    assert.ok(origin.startsWith("http"));
    assert.equal(absoluteCollectUrl("/acme"), `${origin}/acme`);
    assert.equal(absoluteCollectUrl("acme/l/cart"), `${origin}/acme/l/cart`);
  });
});
