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

export type DestinationMethod = "mobile_money" | "bank";

export type CatalogProvider = { id: string; name?: string };

function catalogCountryNode(
  catalog: unknown,
  country: string,
): Record<string, unknown> | null {
  if (!catalog || typeof catalog !== "object") return null;
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const offramp = (data.offramp ?? data) as Record<string, unknown>;
  const countries = (offramp.countries ?? {}) as Record<string, unknown>;
  const countryNode = countries[country];
  return countryNode && typeof countryNode === "object"
    ? (countryNode as Record<string, unknown>)
    : null;
}

function mapProviderRows(list: unknown[]): CatalogProvider[] {
  return list
    .map((p) => {
      const row = p as Record<string, unknown>;
      const id = String(row.id ?? row.code ?? "").trim();
      const name =
        typeof row.name === "string"
          ? row.name
          : typeof row.code === "string"
            ? row.code
            : undefined;
      return { id, name };
    })
    .filter((p) => p.id);
}

function providersFromRails(countryNode: Record<string, unknown>): CatalogProvider[] {
  const rails = countryNode.rails;
  if (!Array.isArray(rails)) return [];
  const merged: CatalogProvider[] = [];
  for (const rail of rails) {
    if (!rail || typeof rail !== "object") continue;
    const r = rail as Record<string, unknown>;
    if (r.enabled === false) continue;
    const list = Array.isArray(r.providers) ? r.providers : [];
    merged.push(...mapProviderRows(list));
  }
  const seen = new Set<string>();
  return merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function extractCatalogProviders(
  catalog: unknown,
  country: string,
  method: DestinationMethod,
): CatalogProvider[] {
  const countryNode = catalogCountryNode(catalog, country);
  if (!countryNode) return [];

  const methods = (countryNode.payment_methods ?? {}) as Record<string, unknown>;
  const node = (methods[method] ?? {}) as Record<string, unknown>;
  const bucketEnabled = node.enabled !== false;
  const list = Array.isArray(node.providers) ? node.providers : [];
  let providers = bucketEnabled ? mapProviderRows(list) : [];

  if (method === "bank" && providers.length === 0) {
    providers = providersFromRails(countryNode);
  }
  return providers;
}

/** Destination types that have at least one quoteable provider for this country. */
export function listCatalogDestinationMethods(
  catalog: unknown,
  country: string,
): DestinationMethod[] {
  const out: DestinationMethod[] = [];
  for (const method of ["mobile_money", "bank"] as const) {
    if (extractCatalogProviders(catalog, country, method).length > 0) {
      out.push(method);
    }
  }
  return out;
}

export function extractCatalogCurrency(catalog: unknown, country: string): string | null {
  const countryNode = catalogCountryNode(catalog, country);
  if (!countryNode) return null;
  const fromCatalog = countryNode.currency ?? countryNode.fiat_currency;
  if (typeof fromCatalog === "string" && fromCatalog.trim()) {
    return fromCatalog.trim().toUpperCase();
  }
  return null;
}
