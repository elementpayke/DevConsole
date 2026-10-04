import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedInvoices, seedLinks } from "../src/lib/checkoutShellData";

describe("checkoutShellData", () => {
  it("does not seed fake payment links that could be copied as live URLs", () => {
    assert.deepEqual(seedLinks(), []);
  });

  it("does not seed fake invoices that imply send/pay actions", () => {
    assert.deepEqual(seedInvoices(), []);
  });
});
