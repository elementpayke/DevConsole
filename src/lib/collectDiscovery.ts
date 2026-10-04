/**
 * Collect (OnRamp) corridor + method discovery for Console Settings → Methods.
 * Reuses partner catalog shapes; filters for onramp so merchants see what
 * customers can eventually pay with — not offramp payout rails.
 */

export type CollectCorridor = {
  country: string;
  currency: string;
  /** True for EUR/USD/… international bank buckets (no ISO country). */
  international?: boolean;
};

export type CollectCatalogMethod = "mobile_money" | "bank" | "card";

export type CollectMerchantPrefs = {
  allow_mpesa: boolean;
  allow_cards: boolean;
  allow_stable: boolean;
};

export type CollectMethodRowStatus =
  | "live"
  | "coming_soon"
  | "catalog_only"
  | "preference_only";

export type CollectMethodRow = {
  id: "mobile_money" | "bank" | "card" | "stable";
  label: string;
  note: string;
  status: CollectMethodRowStatus;
  /** Merchant toggle currently on (where applicable). */
  merchantEnabled: boolean;
  /** Shown on hosted customer checkout today. */
  customerVisible: boolean;
};

/** Partner GET /corridors?order_type=OnRamp */
export function parseCollectOnrampCorridors(payload: unknown): CollectCorridor[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const markets = data.african_markets;
  const rows: CollectCorridor[] = [];
  if (Array.isArray(markets)) {
    for (const row of markets) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const country = typeof r.country === "string" ? r.country.trim().toUpperCase() : "";
      const currency =
        typeof r.currency === "string" ? r.currency.trim().toUpperCase() : "";
      if (!country || !currency) continue;
      if (r.onramp === false) continue;
      rows.push({ country, currency });
    }
  }
  const intl = (data.international_bank ?? {}) as Record<string, unknown>;
  const currencies = intl.currencies;
  if (Array.isArray(currencies)) {
    for (const row of currencies) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const currency =
        typeof r.currency === "string" ? r.currency.trim().toUpperCase() : "";
      if (!currency) continue;
      if (r.onramp === false) continue;
      rows.push({ country: "INTL", currency, international: true });
    }
  }
  return rows.sort((a, b) => {
    if (a.international !== b.international) return a.international ? 1 : -1;
    if (a.country !== b.country) return a.country.localeCompare(b.country);
    return a.currency.localeCompare(b.currency);
  });
}

function onrampCountryNode(
  catalog: unknown,
  country: string,
): Record<string, unknown> | null {
  if (!catalog || typeof catalog !== "object") return null;
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const onramp = (data.onramp ?? data) as Record<string, unknown>;
  const countries = (onramp.countries ?? {}) as Record<string, unknown>;
  const node = countries[country];
  return node && typeof node === "object" ? (node as Record<string, unknown>) : null;
}

function providersLen(node: Record<string, unknown> | undefined): number {
  if (!node || node.enabled === false) return 0;
  const list = Array.isArray(node.providers) ? node.providers : [];
  return list.length;
}

/** OnRamp payment method keys that have at least one provider for this country. */
export function listCollectMethodsForCountry(
  catalog: unknown,
  country: string,
): CollectCatalogMethod[] {
  const countryNode = onrampCountryNode(catalog, country);
  if (!countryNode) return [];
  const methods = (countryNode.payment_methods ?? {}) as Record<string, unknown>;
  const out: CollectCatalogMethod[] = [];
  for (const key of ["mobile_money", "bank", "card"] as const) {
    const node = methods[key] as Record<string, unknown> | undefined;
    if (providersLen(node) > 0) out.push(key);
  }
  return out;
}

/**
 * Console Methods tab rows: catalog availability + merchant prefs + customer visibility.
 * Cards never customer-visible until live; stable is preference-only for now.
 */
export function buildCollectMethodRows(
  catalogMethods: CollectCatalogMethod[],
  prefs: CollectMerchantPrefs,
  country: string,
): CollectMethodRow[] {
  const has = new Set(catalogMethods);
  const rows: CollectMethodRow[] = [];

  if (has.has("mobile_money") || country === "KE") {
    const live = country === "KE";
    rows.push({
      id: "mobile_money",
      label: country === "KE" ? "M-Pesa (mobile money)" : "Mobile money",
      note: live
        ? "STK prompt on the customer’s phone (hosted checkout)."
        : "Available in the partner catalog for this country — hosted STK attach per corridor is rolling out.",
      status: live ? "live" : "catalog_only",
      merchantEnabled: prefs.allow_mpesa,
      customerVisible: live && prefs.allow_mpesa,
    });
  }

  if (has.has("bank")) {
    rows.push({
      id: "bank",
      label: "Bank transfer",
      note: "Listed in the OnRamp catalog for this corridor (Noah / bank rails).",
      status: "catalog_only",
      merchantEnabled: false,
      customerVisible: false,
    });
  }

  rows.push({
    id: "card",
    label: "Cards",
    note: has.has("card")
      ? "Catalog has card providers — coming soon on hosted checkout (hidden from customers)."
      : "Coming soon — not shown on customer checkout.",
    status: "coming_soon",
    merchantEnabled: false,
    customerVisible: false,
  });

  rows.push({
    id: "stable",
    label: "USDC / USDT",
    note: "Preference stored for when stable checkout ships; not shown to customers yet.",
    status: "preference_only",
    merchantEnabled: prefs.allow_stable,
    customerVisible: false,
  });

  return rows;
}

export function formatCollectCorridorLabel(row: CollectCorridor): string {
  if (row.international) {
    return `International bank (${row.currency})`;
  }
  // Lazy import avoided — callers use countryDisplayLabel for ISO countries.
  return `${row.country} · ${row.currency}`;
}
