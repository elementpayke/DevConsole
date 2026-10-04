"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyCollectProfile, updateCheckoutMethods, type CollectProfile } from "@/lib/api/collect";
import { getCollectCatalog, getCollectCorridors } from "@/lib/api/offramp";
import { ApiError } from "@/lib/api/client";
import {
  buildCollectMethodRows,
  listCollectMethodsForCountry,
  parseCollectOnrampCorridors,
  type CollectCorridor,
} from "@/lib/collectDiscovery";
import { countryDisplayLabel } from "@/lib/countryDisplay";

function corridorLabel(row: CollectCorridor): string {
  if (row.international) return `International · ${row.currency}`;
  return countryDisplayLabel(row.country, row.currency);
}

export function SettingsMethodsTab() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [corridors, setCorridors] = useState<CollectCorridor[]>([]);
  const [country, setCountry] = useState("KE");
  const [catalog, setCatalog] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingCorridors, setLoadingCorridors] = useState(true);

  useEffect(() => {
    getMyCollectProfile()
      .then(setProfile)
      .catch((err) => {
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Failed to load methods");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingCorridors(true);
    getCollectCorridors()
      .then((payload) => {
        if (cancelled) return;
        const rows = parseCollectOnrampCorridors(payload);
        setCorridors(rows);
        const african = rows.filter((r) => !r.international);
        if (african.length && !african.some((r) => r.country === country)) {
          setCountry(african[0].country);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalogError(
            err instanceof ApiError ? err.message : "Failed to load supported countries",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCorridors(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!country || country === "INTL") {
      setCatalog(null);
      return;
    }
    let cancelled = false;
    getCollectCatalog(country)
      .then((payload) => {
        if (!cancelled) {
          setCatalog(payload);
          setCatalogError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalog(null);
          setCatalogError(
            err instanceof ApiError ? err.message : "Failed to load methods for country",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  const africanCorridors = useMemo(
    () => corridors.filter((r) => !r.international),
    [corridors],
  );
  const intlCorridors = useMemo(
    () => corridors.filter((r) => r.international),
    [corridors],
  );

  const methodRows = useMemo(() => {
    if (!profile) return [];
    const catalogMethods = listCollectMethodsForCountry(catalog, country);
    return buildCollectMethodRows(catalogMethods, profile, country);
  }, [profile, catalog, country]);

  if (profile === undefined) {
    return <p className="text-[13px]" style={{ color: "var(--muted)" }}>Loading…</p>;
  }

  if (!profile) {
    return (
      <div className="flex max-w-[620px] flex-col gap-3">
        <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
          Create a collect profile under Identity to configure checkout rails.
        </p>
      </div>
    );
  }

  async function toggleMpesa() {
    if (!profile) return;
    const next = {
      allow_mpesa: !profile.allow_mpesa,
      allow_cards: false,
      allow_stable: profile.allow_stable,
    };
    if (!next.allow_mpesa && !next.allow_stable) {
      setError("Keep at least mobile money or USDC/USDT enabled");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      setProfile(await updateCheckoutMethods(next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save methods");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStable() {
    if (!profile) return;
    const next = {
      allow_mpesa: profile.allow_mpesa,
      allow_cards: false,
      allow_stable: !profile.allow_stable,
    };
    if (!next.allow_mpesa && !next.allow_stable) {
      setError("Keep at least mobile money or USDC/USDT enabled");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      setProfile(await updateCheckoutMethods(next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save methods");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Supported collect countries and methods come from the partner OnRamp catalog.
        Hosted checkout today collects via M-Pesa STK in Kenya; other corridors show as
        catalog-supported. Cards stay hidden from customers until live.
      </p>
      {error && <p className="m-0 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
      {catalogError && (
        <p className="m-0 text-[12.5px]" style={{ color: "var(--warn-text)" }}>{catalogError}</p>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="m-0 text-[13px] font-bold">Supported countries</h3>
        {loadingCorridors ? (
          <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>Loading corridors…</p>
        ) : africanCorridors.length === 0 ? (
          <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
            No OnRamp African markets returned from the catalog.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Supported collect countries">
            {africanCorridors.map((row) => {
              const active = row.country === country;
              return (
                <button
                  key={`${row.country}-${row.currency}`}
                  type="button"
                  role="listitem"
                  onClick={() => setCountry(row.country)}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
                  style={{
                    border: active ? "1px solid var(--indigo)" : "1px solid var(--border-strong)",
                    background: active ? "var(--indigo-tint)" : "var(--panel)",
                    color: active ? "var(--indigo-text)" : "var(--ink)",
                  }}
                  aria-pressed={active}
                >
                  {corridorLabel(row)}
                </button>
              );
            })}
          </div>
        )}
        {intlCorridors.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5" aria-label="International bank collect currencies">
            {intlCorridors.map((row) => (
              <span
                key={`intl-${row.currency}`}
                className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold"
                style={{ border: "1px dashed var(--border-strong)", color: "var(--muted)" }}
              >
                {corridorLabel(row)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="m-0 text-[13px] font-bold">
          Methods · {country === "INTL" ? "International" : countryDisplayLabel(country)}
        </h3>
        {methodRows.map((row) => {
          const statusLabel =
            row.status === "live"
              ? "Live on checkout"
              : row.status === "coming_soon"
                ? "Coming soon"
                : row.status === "preference_only"
                  ? "Preference"
                  : "In catalog";
          const canToggle = row.id === "mobile_money" || row.id === "stable";
          return (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-xl p-3.5"
              style={{ border: "1px solid var(--line)", opacity: row.status === "coming_soon" ? 0.85 : 1 }}
              data-method={row.id}
              data-status={row.status}
              data-customer-visible={row.customerVisible ? "true" : "false"}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold">{row.label}</span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{
                      background:
                        row.status === "live"
                          ? "var(--ok-bg)"
                          : row.status === "coming_soon"
                            ? "var(--warn-bg)"
                            : "var(--surface)",
                      color:
                        row.status === "live"
                          ? "var(--ok-text)"
                          : row.status === "coming_soon"
                            ? "var(--warn-text)"
                            : "var(--muted)",
                    }}
                  >
                    {statusLabel}
                  </span>
                </span>
                <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{row.note}</span>
              </span>
              {canToggle ? (
                <button
                  type="button"
                  role="switch"
                  disabled={saving}
                  aria-label={`${row.label}: ${row.merchantEnabled ? "enabled" : "disabled"}`}
                  aria-checked={row.merchantEnabled}
                  onClick={row.id === "mobile_money" ? toggleMpesa : toggleStable}
                  className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
                  style={{ background: row.merchantEnabled ? "var(--indigo)" : "var(--border-strong)" }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                    style={{ left: row.merchantEnabled ? 18 : 2 }}
                  />
                </button>
              ) : (
                <span className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                  {row.customerVisible ? "Customer" : "Hidden"}
                </span>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
