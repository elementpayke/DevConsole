"use client";

import { useEffect, useState } from "react";
import { getMyCollectProfile, updateCheckoutMethods, type CollectProfile } from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";

const METHODS = [
  { key: "allow_mpesa" as const, label: "M-Pesa", note: "Mobile money collections in Kenya." },
  { key: "allow_cards" as const, label: "Cards", note: "Visa and Mastercard via our processor." },
  { key: "allow_stable" as const, label: "USDC / USDT", note: "Direct stablecoin payments." },
];

export function SettingsMethodsTab() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyCollectProfile()
      .then(setProfile)
      .catch((err) => {
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Failed to load methods");
      });
  }, []);

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

  async function toggle(key: "allow_mpesa" | "allow_cards" | "allow_stable") {
    if (!profile) return;
    const next = {
      allow_mpesa: profile.allow_mpesa,
      allow_cards: profile.allow_cards,
      allow_stable: profile.allow_stable,
      [key]: !profile[key],
    };
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
    <div className="flex max-w-[620px] flex-col gap-3">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
        Off means hidden on your hosted checkout for {profile.slug}.
      </p>
      {error && <p className="text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
      {METHODS.map((m) => (
        <div key={m.key} className="flex items-center gap-3 rounded-xl p-3.5" style={{ border: "1px solid var(--line)" }}>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[13px] font-bold">{m.label}</span>
            <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{m.note}</span>
          </span>
          <button
            type="button"
            role="switch"
            disabled={saving}
            aria-label={`${m.label}: ${profile[m.key] ? "enabled" : "disabled"}`}
            aria-checked={profile[m.key]}
            onClick={() => toggle(m.key)}
            className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
            style={{ background: profile[m.key] ? "var(--indigo)" : "var(--border-strong)" }}
          >
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: profile[m.key] ? 18 : 2 }} />
          </button>
        </div>
      ))}
    </div>
  );
}
