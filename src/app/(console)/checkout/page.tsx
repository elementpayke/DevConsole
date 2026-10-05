"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PaymentLinksPanel } from "@/components/checkout/PaymentLinksPanel";
import { InvoicesPanel } from "@/components/checkout/InvoicesPanel";
import { EmbedPanel } from "@/components/checkout/EmbedPanel";
import { ApiModePanel } from "@/components/checkout/ApiModePanel";
import { VerificationBanner } from "@/components/compliance/VerificationBanner";

const TABS = [
  { id: "links", label: "Payment links" },
  { id: "invoices", label: "Invoices" },
  { id: "embed", label: "Embed" },
  { id: "api", label: "API" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "links";

  function setTab(next: TabId) {
    router.replace(`/checkout?tab=${next}`);
  }

  return (
    <>
      <Header title="Checkout" />
      <div className="flex flex-col gap-4 p-5 md:p-7">
        <VerificationBanner surface="checkout" />
        <Link
          href="/paybill"
          className="order-last flex flex-wrap items-center gap-3.5 rounded-xl p-4 no-underline md:order-first"
          style={{ border: "1px dashed var(--border-strong)", background: "var(--surface-soft)", color: "var(--ink)" }}
        >
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
          >
            ⌸
          </span>
          <span className="flex min-w-[180px] flex-1 flex-col gap-0.5">
            <span className="text-[13.5px] font-bold">Paybill account numbers</span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              Generate account references for in-person M-Pesa collections (ops still provisions the shared paybill).
            </span>
          </span>
          <span className="text-[12.5px] font-bold" style={{ color: "var(--indigo-text)" }}>
            Details →
          </span>
        </Link>

        <section
          className="flex flex-wrap items-stretch overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
        >
          <div className="flex min-w-[250px] flex-1 flex-col gap-2 p-4">
            <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              Customer pays with
            </span>
            <span className="flex flex-wrap gap-1.5">
              {["M-Pesa · STK", "Cards · Coming soon"].map((label) => (
                <span
                  key={label}
                  className="rounded-lg px-2.5 py-1.5 text-[11.5px]"
                  style={{ border: "1px solid var(--border-strong)", color: "var(--muted)" }}
                >
                  {label}
                </span>
              ))}
            </span>
          </div>
          <div className="flex min-w-[250px] flex-1 flex-col gap-1 p-4" style={{ borderTop: "1px solid var(--line)" }}>
            <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              You receive
            </span>
            <span className="text-[13.5px] font-bold">Your linked payout destination</span>
            <Link href="/profile" className="text-[12px] font-bold no-underline" style={{ color: "var(--indigo-text)" }}>
              Change
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--border-strong)" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="rounded-t-lg px-3.5 py-2.5 text-[13px] font-semibold"
                style={{
                  color: active ? "var(--indigo-text)" : "var(--muted)",
                  borderBottom: active ? "2px solid var(--indigo)" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="max-w-[920px]">
          {tab === "links" && <PaymentLinksPanel />}
          {tab === "invoices" && <InvoicesPanel />}
          {tab === "embed" && <EmbedPanel />}
          {tab === "api" && <ApiModePanel />}
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
