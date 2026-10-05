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

  it("treats empty NEXT_PUBLIC_COLLECT_ORIGIN as unset", () => {
    const prev = process.env.NEXT_PUBLIC_COLLECT_ORIGIN;
    process.env.NEXT_PUBLIC_COLLECT_ORIGIN = "   ";
    try {
      assert.equal(publicCollectOrigin(), "https://elementpay.net");
      assert.equal(absoluteCollectUrl("/acme/l/cart"), "https://elementpay.net/acme/l/cart");
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_COLLECT_ORIGIN;
      else process.env.NEXT_PUBLIC_COLLECT_ORIGIN = prev;
    }
  });
});
