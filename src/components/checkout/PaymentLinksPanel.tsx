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
import { CheckoutPreviewPanel } from "@/components/checkout/CheckoutPreviewPanel";

export function PaymentLinksPanel() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"KES" | "USDC">("KES");
  const [kind, setKind] = useState<"reusable" | "one_time">("reusable");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [previewLink, setPreviewLink] = useState<PaymentLink | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMyCollectProfile();
        if (cancelled) return;
        setProfile(me);
        if (me) setLinks(await listPaymentLinks());
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setError(err instanceof ApiError ? err.message : "Failed to load payment links");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (profile === undefined) {
    return <p className="text-[13px]" style={{ color: "var(--muted)" }}>Loading payment links…</p>;
  }

  if (!profile) {
    return (
      <ComingSoonPanel
        title="Payment links"
        description="Create a collect profile (shop slug) under Settings → Identity first. Then you can issue real elementpay.net/{slug}/l/… links here."
      />
    );
  }

  async function create() {
    if (!title.trim() || !amount.trim()) return;
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
        currency,
        kind,
      });
      setLinks((prev) => [row, ...prev]);
      setTitle("");
      setAmount("");
      setCurrency("KES");
      setCreating(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create link");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(link: PaymentLink) {
    const url = absoluteCollectUrl(link.public_path);
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      window.setTimeout(() => setCopiedId((c) => (c === link.id ? null : c)), 2000);
    } catch {
      // Clipboard denied or unavailable — leave button label unchanged.
    }
  }

  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-[16px] font-bold">Payment links</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            Live links for {profile.slug} · KES → M-Pesa; USDC → multi-chain pay into your Stellar home
            (customer pays bridge fees)
          </span>
        </span>
        <Button type="button" className="ml-auto" onClick={() => setCreating((v) => !v)}>
          New link
        </Button>
      </div>

      {error && (
        <p className="px-4 pb-2 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>
      )}

      {creating && (
        <div className="flex flex-wrap items-end gap-2.5 p-4" style={{ borderTop: "1px solid var(--line)" }}>
          <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Name
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
          </label>
          <label className="flex w-[120px] flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Amount
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }} />
          </label>
          <label className="flex w-[110px] flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Currency
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "KES" | "USDC")} className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}>
              <option value="KES">KES</option>
              <option value="USDC">USDC</option>
            </select>
          </label>
          <label className="flex w-[140px] flex-col gap-1 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value as "reusable" | "one_time")} className="rounded-lg px-3 py-2 text-[13.5px] font-normal" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}>
              <option value="reusable">Reusable</option>
              <option value="one_time">One-time</option>
            </select>
          </label>
          <Button type="button" disabled={busy} onClick={create}>Create</Button>
        </div>
      )}

      {links.length === 0 ? (
        <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
          No payment links yet.
        </div>
      ) : (
        links.map((link) => (
          <div key={link.id} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-bold">{link.title}</span>
              <span className="mono truncate text-[11.5px]" style={{ color: "var(--faint)" }}>
                {absoluteCollectUrl(link.public_path)}
              </span>
            </span>
            <span className="mono text-[13px] font-semibold">{link.currency} {link.amount.toLocaleString()}</span>
            <button
              type="button"
              onClick={() => setPreviewLink(link)}
              className="rounded-lg px-3 py-2 text-[12.5px] font-bold"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => copyLink(link)}
              className="rounded-lg px-3 py-2 text-[12.5px] font-bold"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}
            >
              {copiedId === link.id ? "Copied" : "Copy link"}
            </button>
          </div>
        ))
      )}

      {previewLink && (
        <CheckoutPreviewPanel profile={profile} link={previewLink} onClose={() => setPreviewLink(null)} />
      )}
    </section>
  );
}
