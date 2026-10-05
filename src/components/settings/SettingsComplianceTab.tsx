"use client";

import { useState } from "react";
import Link from "next/link";
import { usePartnerCustomer } from "@/lib/auth/usePartnerCustomer";
import { RequestLiveAccessModal } from "@/components/compliance/RequestLiveAccessModal";
import { GoLiveModal } from "@/components/compliance/GoLiveModal";
import type { PartnerCustomerStatus } from "@/lib/types";

const STEP_DONE_AT: Record<string, PartnerCustomerStatus[]> = {
  "Account created": ["incomplete", "pending_review", "approved", "active", "rejected", "suspended"],
  "Business details": ["pending_review", "approved", "active"],
  "Document review": ["approved", "active"],
  "Live access": ["active"],
};

const STATUS_COPY: Record<PartnerCustomerStatus, { label: string; note: string }> = {
  incomplete: { label: "Not started", note: "Finish verification to accept real money." },
  pending_review: { label: "In review", note: "We're reviewing your details. Usually under a day." },
  approved: { label: "Approved", note: "You're verified — go live whenever you're ready." },
  active: { label: "Live", note: "Your business can accept live payments." },
  rejected: { label: "Needs changes", note: "Your request needs changes before it can be approved." },
  suspended: { label: "Suspended", note: "Contact live@elementpay.net to resolve this." },
};

export function SettingsComplianceTab() {
  const { partnerCustomer, loading, refresh } = usePartnerCustomer();
  const [modal, setModal] = useState<"request" | "golive" | null>(null);

  const status = partnerCustomer?.status ?? "incomplete";
  const steps = Object.entries(STEP_DONE_AT).map(([label, doneAt]) => ({
    label,
    done: doneAt.includes(status),
  }));
  const copy = STATUS_COPY[status];

  return (
    <div className="flex max-w-[620px] flex-col gap-4">
      <div
        className="flex flex-wrap items-center gap-3.5 rounded-xl p-4"
        style={{ border: "1px solid var(--indigo)", background: "var(--indigo-tint)" }}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--indigo-text)" }}>Verification</span>
          <span className="text-[16px] font-bold">{loading ? "Loading…" : copy.label}</span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>{copy.note}</span>
        </span>
        {!loading && !partnerCustomer && (
          <Link
            href="/onboarding"
            className="ml-auto rounded-lg px-4 py-2.5 text-[12.5px] font-bold no-underline"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Add business details
          </Link>
        )}
        {!loading && partnerCustomer && status === "incomplete" && (
          <button
            type="button"
            onClick={() => setModal("request")}
            className="ml-auto rounded-lg px-4 py-2.5 text-[12.5px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Request live access
          </button>
        )}
        {!loading && status === "approved" && (
          <button
            type="button"
            onClick={() => setModal("golive")}
            className="ml-auto rounded-lg px-4 py-2.5 text-[12.5px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Go live
          </button>
        )}
      </div>

      <div className="flex items-start gap-1.5 pt-1">
        {steps.map((s) => (
          <span key={s.label} className="flex flex-1 flex-col gap-1.5">
            <span
              className="h-1.5 rounded-full"
              style={{ background: s.done ? "var(--indigo)" : "var(--line)" }}
            />
            <span className="text-[11px] font-semibold" style={{ color: s.done ? "var(--indigo-text)" : "var(--faint)" }}>
              {s.label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex gap-5 pt-1">
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>Test-mode limit</span>
          <span className="mono text-[16px] font-medium">KES 0</span>
          <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>No cap — pretend money</span>
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>Live limit</span>
          <span className="mono text-[16px] font-medium">{status === "active" ? "Set by ElementPay" : "Locked"}</span>
          <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>
            {status === "active" ? "Your account limit is not shown here yet" : "Unlocks after verification"}
          </span>
        </span>
      </div>

      {modal === "request" && partnerCustomer && (
        <RequestLiveAccessModal
          partnerCustomer={partnerCustomer}
          onClose={() => setModal(null)}
          onSubmitted={refresh}
        />
      )}
      {modal === "golive" && <GoLiveModal onClose={() => setModal(null)} />}
    </div>
  );
}
