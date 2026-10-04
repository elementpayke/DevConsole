"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  absoluteCollectUrl,
  createPaymentLink,
  getMyCollectProfile,
  listPaymentLinks,
  type CollectProfile,
  type PaymentLink,
} from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";
import { ComingSoonPanel } from "@/components/checkout/ComingSoonPanel";

export function InvoicesPanel() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [rows, setRows] = useState<PaymentLink[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMyCollectProfile()
      .then(async (me) => {
        setProfile(me);
        if (me) {
          const all = await listPaymentLinks();
          setRows(all.filter((r) => Boolean(r.client_email)));
        }
      })
      .catch((err) => {
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Failed to load invoices");
      });
  }, []);

  if (profile === undefined) {
    return <p className="text-[13px]" style={{ color: "var(--muted)" }}>Loading invoices…</p>;
  }

  if (!profile) {
    return (
      <ComingSoonPanel
        title="Invoices"
        description="Create a collect profile under Settings → Identity first. Invoices are one-time payment requests with a client email on record."
      />
    );
  }

  async function create() {
    if (!title.trim() || !amount.trim() || !email.trim()) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than zero");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const row = await createPaymentLink({
        title: title.trim(),
        amount: parsedAmount,
        kind: "one_time",
        client_email: email.trim(),
      });
      setRows((prev) => [row, ...prev]);
      setTitle("");
      setAmount("");
      setEmail("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <div className="p-4">
        <span className="text-[16px] font-bold">Invoices</span>
        <p className="m-0 mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
          One-time payment requests with a client email. Email delivery is not sent from Console yet — copy the pay link.
        </p>
      </div>
      {error && <p className="px-4 pb-2 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
      <div className="flex flex-wrap items-end gap-2.5 p-4" style={{ borderTop: "1px solid var(--line)" }}>
        <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
        </label>
        <label className="flex w-[110px] flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Amount
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
        </label>
        <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Client email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
        </label>
        <Button type="button" disabled={busy} onClick={create}>Create invoice</Button>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
          No invoices yet.
        </div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-bold">{row.title}</span>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{row.client_email}</span>
              <span className="mono truncate text-[11.5px]" style={{ color: "var(--faint)" }}>
                {absoluteCollectUrl(row.public_path)}
              </span>
            </span>
            <span className="mono text-[13px] font-semibold">
              {row.currency} {row.amount.toLocaleString()}
            </span>
          </div>
        ))
      )}
    </section>
  );
}
