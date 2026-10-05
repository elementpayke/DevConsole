"use client";

import { Modal } from "@/components/ui/Modal";
import type { Invoice } from "@/lib/checkoutShellData";

export function InvoiceDocModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <Modal onClose={onClose} width={620}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-[15px] font-bold">{invoice.number}</span>
        <span
          className="rounded-md px-2 py-1 text-[11px] font-bold"
          style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
        >
          {invoice.status}
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto rounded-lg px-3 py-1.5 text-[12px] font-semibold"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}
        >
          Download PDF
        </button>
      </div>

      <article
        className="flex flex-col gap-6 rounded-xl p-6 text-[13px]"
        style={{ background: "var(--panel-solid)", color: "var(--ink)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[14px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            EP
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-bold">ElementPay merchant</span>
            <span className="text-[12px]" style={{ color: "#5b5b72" }}>{invoice.email}</span>
          </span>
          <span className="ml-auto flex flex-col items-end gap-0.5 text-right">
            <span className="text-[22px] font-bold">Invoice</span>
            <span className="mono text-[12px]" style={{ color: "#5b5b72" }}>{invoice.number}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <span className="flex flex-col gap-0.5">
            <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "#8a8aa0" }}>Bill to</span>
            <span className="font-bold">{invoice.client}</span>
            <span style={{ color: "#5b5b72" }}>{invoice.email}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "#8a8aa0" }}>Due</span>
            <span className="font-semibold">{invoice.due}</span>
          </span>
        </div>

        <div className="flex flex-col">
          <div
            className="grid grid-cols-[1fr_96px] gap-2.5 pb-2 text-[10.5px] font-bold tracking-wide uppercase"
            style={{ borderBottom: "1.5px solid #16162a", color: "#8a8aa0" }}
          >
            <span>Item</span><span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-[1fr_96px] gap-2.5 py-3" style={{ borderBottom: "1px solid #ececf2" }}>
            <span className="font-semibold">{invoice.item}</span>
            <span className="mono text-right">{invoice.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-end pt-3.5">
            <span className="flex w-[220px] justify-between pt-2.5 text-[15px] font-bold" style={{ borderTop: "1px solid #ececf2" }}>
              <span>Total due</span>
              <span className="mono">{invoice.currency} {invoice.amount.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-lg p-4" style={{ background: "var(--indigo-tint)" }}>
          <span className="flex flex-col gap-0.5">
            <span className="font-bold">Pay this invoice</span>
            <span className="text-[12px]" style={{ color: "#5b5b72" }}>M-Pesa, mobile money, card, bank or stablecoins</span>
          </span>
          <span
            className="ml-auto rounded-lg px-4 py-2.5 text-[13px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Pay {invoice.currency} {invoice.amount.toLocaleString()}
          </span>
        </div>
      </article>
    </Modal>
  );
}
