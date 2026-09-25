/** ISO 3166-1 alpha-2 → display name for supported African corridors. */
const AFRICAN_COUNTRY_NAMES: Record<string, string> = {
  BW: "Botswana",
  KE: "Kenya",
  MW: "Malawi",
  NG: "Nigeria",
  RW: "Rwanda",
  TZ: "Tanzania",
  ZA: "South Africa",
  UG: "Uganda",
  GH: "Ghana",
};

/** Regional-indicator flag emoji for a two-letter ISO country code. */
export function countryFlagEmoji(iso2: string): string {
  const cc = iso2.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (cc.charCodeAt(0) - 65),
    base + (cc.charCodeAt(1) - 65),
  );
}

export function countryDisplayLabel(iso2: string, currency?: string): string {
  const name = AFRICAN_COUNTRY_NAMES[iso2.toUpperCase()] ?? iso2.toUpperCase();
  const flag = countryFlagEmoji(iso2);
  const cur = currency?.trim().toUpperCase();
  if (cur) return `${flag} ${name} (${cur})`.trim();
  return `${flag} ${name}`.trim();
}
