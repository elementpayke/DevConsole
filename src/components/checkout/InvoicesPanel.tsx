"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { newId, seedInvoices, type Invoice } from "@/lib/checkoutShellData";
import { InvoiceDocModal } from "@/components/checkout/InvoiceDocModal";

const STATUS_STYLE: Record<Invoice["status"], { bg: string; text: string }> = {
  Draft: { bg: "var(--surface)", text: "var(--muted)" },
  Sent: { bg: "var(--indigo-tint)", text: "var(--indigo-text)" },
  Paid: { bg: "var(--ok-bg)", text: "var(--ok-text)" },
  Overdue: { bg: "var(--bad-bg)", text: "var(--bad-text)" },
};

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");

  function createInvoice() {
    if (!client.trim() || !amount.trim()) return;
    const number = `INV-${1000 + invoices.length + 1}`;
    setInvoices((prev) => [
      {
        id: newId("i"),
        number,
        client: client.trim(),
        email: email.trim(),
        item: item.trim() || "Services rendered",
        amount: Number(amount) || 0,
        currency: "KES",
        due: "On receipt",
        status: "Sent",
      },
      ...prev,
    ]);
    setClient("");
    setEmail("");
    setItem("");
    setAmount("");
    setCreating(false);
  }

  const paid = invoices.filter((i) => i.status === "Paid").length;
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-[16px] font-bold">Invoices</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>Line items, a due date and a pay button.</span>
        </span>
        <Button type="button" className="ml-auto" onClick={() => setCreating((v) => !v)}>
          New invoice
        </Button>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", borderTop: "1px solid var(--line)", background: "var(--surface-soft)" }}
      >
        <Stat label="Paid" value={String(paid)} />
        <Stat label="Outstanding" value={`KES ${outstanding.toLocaleString()}`} />
        <Stat label="Total" value={String(invoices.length)} />
      </div>

      {creating && (
        <div className="flex flex-col gap-2.5 p-4" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="flex flex-wrap gap-2.5">
            <Field label="Bill to">
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Kesho Foods Ltd" style={inputStyle} />
            </Field>
            <Field label="Their email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="accounts@kesho.co.ke" style={inputStyle} />
            </Field>
          </div>
          <Field label="What it covers">
            <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="September supply — 40 crates" style={inputStyle} />
          </Field>
          <div className="flex flex-wrap items-end gap-2.5">
            <Field label="Amount (KES)">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="84000" style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono)" }} />
            </Field>
            <Button type="button" onClick={createInvoice}>Send invoice</Button>
          </div>
        </div>
      )}

      {invoices.map((inv) => {
        const style = STATUS_STYLE[inv.status];
        return (
          <div key={inv.id} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
            <span className="flex min-w-[180px] flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="text-[13.5px] font-semibold">{inv.client}</span>
                <span className="rounded-md px-1.5 py-0.5 text-[10.5px] font-bold" style={{ background: style.bg, color: style.text }}>
                  {inv.status}
                </span>
              </span>
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                <span className="mono">{inv.number}</span> · {inv.due}
              </span>
            </span>
            <span className="mono text-[13px] font-semibold whitespace-nowrap">
              {inv.currency} {inv.amount.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => setViewing(inv)}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
              style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
            >
              View
            </button>
          </div>
        );
      })}

      {viewing && <InvoiceDocModal invoice={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13.5,
  width: "100%",
};

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
    <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
      {label}
      {children}
    </label>
  );
}
