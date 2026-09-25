import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countryDisplayLabel, countryFlagEmoji } from "../src/lib/countryDisplay";
import { parseOfframpCorridors } from "../src/lib/offrampDiscovery";

describe("parseOfframpCorridors", () => {
  it("returns off-ramp African markets sorted by country", () => {
    const rows = parseOfframpCorridors({
      african_markets: [
        { country: "TZ", currency: "TZS", offramp: true, onramp: true },
        { country: "KE", currency: "KES", offramp: true },
        { country: "US", currency: "USD", offramp: false },
      ],
    });
    assert.deepEqual(rows, [
      { country: "KE", currency: "KES" },
      { country: "TZ", currency: "TZS" },
    ]);
  });

  it("unwraps envelope data", () => {
    const rows = parseOfframpCorridors({
      data: {
        african_markets: [{ country: "UG", currency: "UGX", offramp: true }],
      },
    });
    assert.deepEqual(rows, [{ country: "UG", currency: "UGX" }]);
  });
});

describe("countryDisplayLabel", () => {
  it("includes flag emoji and currency", () => {
    const label = countryDisplayLabel("KE", "KES");
    assert.match(label, /^🇰🇪 Kenya \(KES\)$/);
  });

  it("countryFlagEmoji returns two regional indicators", () => {
    assert.equal(countryFlagEmoji("tz").length, 4);
  });
});
