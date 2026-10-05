"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { updatePayoutDestination } from "@/lib/api/payoutDestination";
import { ApiError } from "@/lib/api/client";
import type { PayoutDestination, PayoutMethod, PayoutMode } from "@/lib/types";

const CURRENCIES = [
  { code: "KES", label: "KES — Kenya Shilling" },
  { code: "TZS", label: "TZS — Tanzania Shilling" },
  { code: "UGX", label: "UGX — Uganda Shilling" },
  { code: "RWF", label: "RWF — Rwanda Franc" },
  { code: "GHS", label: "GHS — Ghana Cedi" },
  { code: "NGN", label: "NGN — Nigeria Naira" },
];

const fieldStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  width: "100%",
  boxSizing: "border-box",
};

function emptyDestination(): PayoutDestination {
  return { mode: "local_currency", currency: "KES", method: "mobile_money" };
}

export function SettingsMoneyTab() {
  const { user } = useAuth();
  const saved = user?.default_payout_json ?? null;
  const [draft, setDraft] = useState<PayoutDestination>(saved ?? emptyDestination());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved ?? emptyDestination());

  function update<K extends keyof PayoutDestination>(key: K, value: PayoutDestination[K]) {
    setSuccess(false);
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function discard() {
    setDraft(saved ?? emptyDestination());
    setError(null);
    setSuccess(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await updatePayoutDestination(draft);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save payout destination.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="p-[22px]">
        <div className="mb-0.5 text-[14.5px] font-bold">Where should money go?</div>
        <div className="mb-4 text-[12.5px] text-subtle">
          Converted and sent to your payout account, or kept as stablecoin in your wallet.
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {(
            [
              { mode: "local_currency" as PayoutMode, title: "Local currency", note: "Converted and sent to your payout account." },
              { mode: "stablecoin" as PayoutMode, title: "Stablecoin in your wallet", note: "Stays as USDC or USDT in your ElementPay wallet." },
            ]
          ).map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => update("mode", opt.mode)}
              className="flex items-start gap-2.5 rounded-xl p-3.5 text-left"
              style={{
                border: `1px solid ${draft.mode === opt.mode ? "var(--indigo)" : "var(--border)"}`,
                background: draft.mode === opt.mode ? "var(--indigo-tint)" : "var(--panel)",
              }}
            >
              <span
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full"
                style={{
                  border: `1.5px solid ${draft.mode === opt.mode ? "var(--indigo)" : "var(--border-strong)"}`,
                  background: draft.mode === opt.mode ? "var(--indigo)" : "transparent",
                }}
              />
              <span>
                <span className="block text-[13px] font-bold">{opt.title}</span>
                <span className="block text-[11.5px]" style={{ color: "var(--muted)" }}>{opt.note}</span>
              </span>
            </button>
          ))}
        </div>

        {draft.mode === "local_currency" && (
          <>
            <div className="mb-3.5 text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Where converted local currency lands. Payouts batch through the day.
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Currency
                <select
                  style={fieldStyle}
                  value={draft.currency ?? "KES"}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Method
                <select
                  style={fieldStyle}
                  value={draft.method ?? "mobile_money"}
                  onChange={(e) => update("method", e.target.value as PayoutMethod)}
                >
                  <option value="mobile_money">M-Pesa (Mobile)</option>
                  <option value="bank">Bank transfer</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Account name
                <input
                  style={fieldStyle}
                  placeholder="Name on the account"
                  value={draft.account_name ?? ""}
                  onChange={(e) => update("account_name", e.target.value)}
                />
              </label>

              {draft.method === "bank" ? (
                <>
                  <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                    Account number
                    <input
                      style={{ ...fieldStyle, fontFamily: "var(--font-jetbrains-mono)" }}
                      placeholder="10-digit account number"
                      value={draft.account_number ?? ""}
                      onChange={(e) => update("account_number", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                    Bank
                    <input
                      style={fieldStyle}
                      placeholder="e.g. GTBank"
                      value={draft.bank_name ?? ""}
                      onChange={(e) => update("bank_name", e.target.value)}
                    />
                  </label>
                </>
              ) : (
                <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Phone number
                  <input
                    style={{ ...fieldStyle, fontFamily: "var(--font-jetbrains-mono)" }}
                    placeholder="+254XXXXXXXXX"
                    value={draft.phone_number ?? ""}
                    onChange={(e) => update("phone_number", e.target.value)}
                  />
                </label>
              )}
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="text-[12px]" style={{ color: "var(--faint)" }}>Changes apply to new payments only.</span>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="secondary" disabled={!dirty || busy} onClick={discard}>
              Discard
            </Button>
            <Button type="button" disabled={!dirty || busy} onClick={save}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-[12.5px] font-medium" style={{ color: "var(--bad-text)" }}>{error}</p>}
        {success && <p className="mt-3 text-[12.5px] font-medium" style={{ color: "var(--ok-text)" }}>Saved.</p>}
      </GlassCard>
    </div>
  );
}
