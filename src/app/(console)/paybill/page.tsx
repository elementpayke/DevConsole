"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import {
  createPaybillReference,
  getMyCollectProfile,
  listPaybillReferences,
  type CollectProfile,
  type PaybillReference,
} from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";

export default function PaybillPage() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [rows, setRows] = useState<PaybillReference[]>([]);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"reusable" | "one_time">("reusable");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMyCollectProfile();
        if (cancelled) return;
        setProfile(me);
        if (me) setRows(await listPaybillReferences());
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setError(err instanceof ApiError ? err.message : "Failed to load paybill refs");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function generate() {
    if (!label.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createPaybillReference({ label: label.trim(), type });
      setRows((prev) => [row, ...prev]);
      setLabel("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account number");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="Paybill" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <Link href="/checkout" className="text-[12.5px] font-semibold no-underline" style={{ color: "var(--muted)" }}>
          ← Checkout
        </Link>

        <div
          className="rounded-xl px-4 py-3 text-[12.5px] leading-relaxed"
          style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
        >
          Account numbers are stored on your collect profile. Sharing them for live M-Pesa C2B
          still requires ElementPay paybill provisioning — confirm with ops before collecting real money.
        </div>

        {profile === undefined ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>Loading…</p>
        ) : !profile ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Create a collect profile under Settings → Identity before generating account numbers.
          </p>
        ) : (
          <>
            {error && <p className="text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
            <section className="flex flex-col gap-3 rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
              <h2 className="m-0 text-[15px] font-bold">Generate an account number</h2>
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Label
                <input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-lg px-3 py-2.5 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
              </label>
              <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)", width: "fit-content" }}>
                {(["reusable", "one_time"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className="rounded-md px-3 py-1.5 text-[12.5px] font-bold" style={type === t ? { background: "var(--panel)" } : { color: "var(--muted)" }}>
                    {t === "reusable" ? "Reusable" : "One-time"}
                  </button>
                ))}
              </div>
              <Button type="button" disabled={busy} onClick={generate} className="self-start">
                Generate account number
              </Button>
            </section>

            <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
              <div className="p-4"><h2 className="m-0 text-[15px] font-bold">Account numbers</h2></div>
              {rows.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>None yet.</div>
              ) : (
                rows.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
                    <span className="mono text-[13.5px] font-semibold">{r.account_number}</span>
                    <span className="text-[12px]" style={{ color: "var(--muted)" }}>{r.label}</span>
                    <span className="ml-auto text-[11.5px] font-bold" style={{ color: "var(--indigo-text)" }}>{r.type}</span>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
