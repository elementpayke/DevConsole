export type OfframpCorridor = {
  country: string;
  currency: string;
};

/** Partner GET /corridors — African markets with off-ramp enabled (order_type filtered server-side). */
export function parseOfframpCorridors(payload: unknown): OfframpCorridor[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const markets = data.african_markets;
  if (!Array.isArray(markets)) return [];
  const rows: OfframpCorridor[] = [];
  for (const row of markets) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const country = typeof r.country === "string" ? r.country.trim().toUpperCase() : "";
    const currency =
      typeof r.currency === "string" ? r.currency.trim().toUpperCase() : "";
    if (!country || !currency) continue;
    if (r.offramp === false) continue;
    rows.push({ country, currency });
  }
  return rows.sort((a, b) => a.country.localeCompare(b.country));
}

export type CatalogProvider = { id: string; name?: string };

export function extractCatalogProviders(
  catalog: unknown,
  country: string,
  method: "mobile_money" | "bank",
): CatalogProvider[] {
  if (!catalog || typeof catalog !== "object") return [];
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const offramp = (data.offramp ?? data) as Record<string, unknown>;
  const countries = (offramp.countries ?? {}) as Record<string, unknown>;
  const countryNode = (countries[country] ?? {}) as Record<string, unknown>;
  const methods = (countryNode.payment_methods ?? {}) as Record<string, unknown>;
  const node = (methods[method] ?? {}) as Record<string, unknown>;
  const list = Array.isArray(node.providers) ? node.providers : [];
  return list
    .map((p) => {
      const row = p as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        name: typeof row.name === "string" ? row.name : undefined,
      };
    })
    .filter((p) => p.id);
}

export function extractCatalogCurrency(catalog: unknown, country: string): string | null {
  if (!catalog || typeof catalog !== "object") return null;
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const offramp = (data.offramp ?? data) as Record<string, unknown>;
  const countries = (offramp.countries ?? {}) as Record<string, unknown>;
  const countryNode = (countries[country] ?? {}) as Record<string, unknown>;
  const fromCatalog = countryNode.currency ?? countryNode.fiat_currency;
  if (typeof fromCatalog === "string" && fromCatalog.trim()) {
    return fromCatalog.trim().toUpperCase();
  }
  return null;
}
