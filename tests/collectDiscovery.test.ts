import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCollectMethodRows,
  listCollectMethodsForCountry,
  parseCollectOnrampCorridors,
  type CollectMerchantPrefs,
} from "../src/lib/collectDiscovery";
import { countryDisplayLabel } from "../src/lib/countryDisplay";

describe("parseCollectOnrampCorridors", () => {
  it("returns on-ramp African markets sorted by country", () => {
    const rows = parseCollectOnrampCorridors({
      african_markets: [
        { country: "TZ", currency: "TZS", onramp: true, offramp: true },
        { country: "KE", currency: "KES", onramp: true },
        { country: "ZA", currency: "ZAR", onramp: false, offramp: true },
        { country: "NG", currency: "NGN", onramp: true },
      ],
    });
    assert.deepEqual(rows, [
      { country: "KE", currency: "KES" },
      { country: "NG", currency: "NGN" },
      { country: "TZ", currency: "TZS" },
    ]);
  });

  it("unwraps envelope data", () => {
    const rows = parseCollectOnrampCorridors({
      data: {
        african_markets: [{ country: "UG", currency: "UGX", onramp: true }],
      },
    });
    assert.deepEqual(rows, [{ country: "UG", currency: "UGX" }]);
  });

  it("includes international bank currencies when onramp is enabled", () => {
    const rows = parseCollectOnrampCorridors({
      african_markets: [],
      international_bank: {
        currencies: [
          { currency: "EUR", onramp: true },
          { currency: "GBP", onramp: false },
          { currency: "USD", onramp: true },
        ],
      },
    });
    assert.deepEqual(rows, [
      { country: "INTL", currency: "EUR", international: true },
      { country: "INTL", currency: "USD", international: true },
    ]);
  });
});

describe("listCollectMethodsForCountry", () => {
  it("lists onramp methods that have providers", () => {
    const catalog = {
      onramp: {
        countries: {
          KE: {
            currency: "KES",
            payment_methods: {
              mobile_money: {
                enabled: true,
                providers: [{ id: "mpesa", name: "M-Pesa" }],
              },
              bank: { enabled: true, providers: [{ id: "noah", name: "Bank" }] },
              card: { enabled: true, providers: [] },
            },
          },
        },
      },
    };
    assert.deepEqual(listCollectMethodsForCountry(catalog, "KE"), [
      "mobile_money",
      "bank",
    ]);
  });

  it("returns empty when country missing", () => {
    assert.deepEqual(listCollectMethodsForCountry({}, "KE"), []);
  });
});

describe("buildCollectMethodRows", () => {
  const prefs: CollectMerchantPrefs = {
    allow_mpesa: true,
    allow_cards: false,
    allow_stable: true,
  };

  it("maps catalog methods to console rows with live/coming_soon status", () => {
    const rows = buildCollectMethodRows(
      ["mobile_money", "bank", "card"],
      prefs,
      "KE",
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    assert.equal(byId.mobile_money?.status, "live");
    assert.equal(byId.mobile_money?.merchantEnabled, true);
    assert.equal(byId.mobile_money?.customerVisible, true);
    assert.equal(byId.card?.status, "coming_soon");
    assert.equal(byId.card?.customerVisible, false);
    assert.equal(byId.bank?.status, "catalog_only");
    assert.equal(byId.stable?.status, "live");
    assert.equal(byId.stable?.customerVisible, true);
    assert.match(byId.stable?.label ?? "", /USDC/);
    assert.doesNotMatch(byId.stable?.label ?? "", /USDT/);
  });

  it("marks M-Pesa off when merchant disabled it", () => {
    const rows = buildCollectMethodRows(["mobile_money"], {
      ...prefs,
      allow_mpesa: false,
    }, "KE");
    assert.equal(rows.find((r) => r.id === "mobile_money")?.merchantEnabled, false);
    assert.equal(rows.find((r) => r.id === "mobile_money")?.customerVisible, false);
  });

  it("always includes stable preference row", () => {
    const rows = buildCollectMethodRows([], prefs, "NG");
    assert.ok(rows.some((r) => r.id === "stable"));
  });
});

describe("country labels for collect corridors", () => {
  it("renders Kenya label used in Methods tab", () => {
    assert.match(countryDisplayLabel("KE", "KES"), /Kenya \(KES\)/);
  });
});
