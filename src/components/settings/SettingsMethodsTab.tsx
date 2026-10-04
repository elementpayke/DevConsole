"use client";

import { useEffect, useState } from "react";
import { getMyCollectProfile, updateCheckoutMethods, type CollectProfile } from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";

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

  async function toggleMpesa() {
    if (!profile) return;
    const next = {
      allow_mpesa: !profile.allow_mpesa,
      allow_cards: false,
      allow_stable: profile.allow_stable,
    };
    if (!next.allow_mpesa && !next.allow_stable) {
      setError("Keep at least M-Pesa or USDC/USDT enabled");
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
      setError("Keep at least M-Pesa or USDC/USDT enabled");
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
    <div className="flex max-w-[620px] flex-col gap-3">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
        Hosted checkout currently collects via M-Pesa STK. Cards are coming soon and are hidden from customers.
      </p>
      {error && <p className="text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}

      <div className="flex items-center gap-3 rounded-xl p-3.5" style={{ border: "1px solid var(--line)" }}>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-bold">M-Pesa</span>
          <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
            STK prompt on the customer’s phone.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          disabled={saving}
          aria-label={`M-Pesa: ${profile.allow_mpesa ? "enabled" : "disabled"}`}
          aria-checked={profile.allow_mpesa}
          onClick={toggleMpesa}
          className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
          style={{ background: profile.allow_mpesa ? "var(--indigo)" : "var(--border-strong)" }}
        >
          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: profile.allow_mpesa ? 18 : 2 }} />
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl p-3.5 opacity-70" style={{ border: "1px solid var(--line)" }}>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-bold">Cards</span>
          <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
            Coming soon — not shown on customer checkout.
          </span>
        </span>
        <span
          className="rounded-md px-2 py-1 text-[11px] font-bold"
          style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
        >
          Coming soon
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl p-3.5" style={{ border: "1px solid var(--line)" }}>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-bold">USDC / USDT</span>
          <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
            Preference stored for when stable checkout ships; not shown to customers yet.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          disabled={saving}
          aria-label={`USDC / USDT: ${profile.allow_stable ? "enabled" : "disabled"}`}
          aria-checked={profile.allow_stable}
          onClick={toggleStable}
          className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
          style={{ background: profile.allow_stable ? "var(--indigo)" : "var(--border-strong)" }}
        >
          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: profile.allow_stable ? 18 : 2 }} />
        </button>
      </div>
    </div>
  );
}
