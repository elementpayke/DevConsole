"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { newId, seedLinks, type PaymentLink } from "@/lib/checkoutShellData";

export function PaymentLinksPanel({ onPreview }: { onPreview: () => void }) {
  const [links, setLinks] = useState<PaymentLink[]>(seedLinks);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentLink["type"]>("Reusable");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function createLink() {
    if (!name.trim() || !amount.trim()) return;
    setLinks((prev) => [
      { id: newId("l"), name: name.trim(), amount: Number(amount) || 0, currency: "KES", type, active: true, paidCount: 0 },
      ...prev,
    ]);
    setName("");
    setAmount("");
    setCreating(false);
  }

  function copyLink(id: string) {
    const url = `https://pay.elementpay.net/c/${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
  }

  const paidTotal = links.reduce((sum, l) => sum + l.paidCount, 0);

  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-[16px] font-bold">Payment links</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            One link for many buyers, or one per order.
          </span>
        </span>
        <Button type="button" className="ml-auto" onClick={() => setCreating((v) => !v)}>
          New link
        </Button>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", borderTop: "1px solid var(--line)", background: "var(--surface-soft)" }}
      >
        <Stat label="Active links" value={String(links.filter((l) => l.active).length)} />
        <Stat label="Total paid" value={String(paidTotal)} />
        <Stat label="Links created" value={String(links.length)} />
      </div>

      {creating && (
        <div className="flex flex-wrap items-end gap-2.5 p-4" style={{ borderTop: "1px solid var(--line)" }}>
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard cart"
              className="w-full rounded-lg px-3 py-2 text-[13.5px]"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
            />
          </Field>
          <Field label="Amount (KES)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              inputMode="numeric"
              className="mono w-full rounded-lg px-3 py-2 text-[13.5px]"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
            />
          </Field>
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentLink["type"])}
              className="rounded-lg px-3 py-2 text-[13.5px]"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
            >
              <option value="Reusable">Reusable</option>
              <option value="One-time">One-time</option>
            </select>
          </Field>
          <Button type="button" onClick={createLink}>Create</Button>
        </div>
      )}

      {links.map((l) => (
        <div key={l.id} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="flex min-w-[180px] flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold">{l.name}</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[10.5px] font-bold"
                style={{ background: l.active ? "var(--ok-bg)" : "var(--surface)", color: l.active ? "var(--ok-text)" : "var(--muted)" }}
              >
                {l.active ? "Active" : "Disabled"}
              </span>
            </span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              {l.currency} {l.amount.toLocaleString()} · {l.type} · {l.paidCount} paid
            </span>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onPreview}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
              style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => copyLink(l.id)}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
              style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
            >
              {copiedId === l.id ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-0.5 p-3">
      <span className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="mono text-[15px] font-semibold">{value}</span>
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
      {label}
      {children}
    </label>
  );
}
