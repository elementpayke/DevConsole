"use client";

import { useState } from "react";
import { usePartnerCustomer } from "@/lib/auth/usePartnerCustomer";
import { RequestLiveAccessModal } from "@/components/compliance/RequestLiveAccessModal";

/**
 * Non-blocking nudge toward KYB — test mode stays fully usable either way,
 * so this never replaces page content, just sits above it.
 */
export function VerificationBanner({ surface }: { surface: string }) {
  const { partnerCustomer, loading, refresh } = usePartnerCustomer();
  const [open, setOpen] = useState(false);
  const status = partnerCustomer?.status ?? "incomplete";

  if (loading || !partnerCustomer) return null;
  if (status === "approved" || status === "active") return null;

  const pending = status === "pending_review";

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-xl p-4"
      style={{ border: "1px solid var(--border)", background: "var(--surface-soft)" }}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
      >
        🔒
      </span>
      <span className="flex min-w-[200px] flex-1 flex-col gap-0.5">
        <span className="text-[13.5px] font-bold">Verify your business to set up {surface}</span>
        <span className="text-[12px]" style={{ color: "var(--muted)" }}>
          {pending
            ? "Thanks, we're reviewing your details. This unlocks as soon as you're approved."
            : "Takes a few minutes. Test mode stays open while we review."}
        </span>
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
      >
        {pending ? "Request submitted" : "Start verification"}
      </button>

      {open && (
        <RequestLiveAccessModal
          partnerCustomer={partnerCustomer}
          onClose={() => setOpen(false)}
          onSubmitted={refresh}
        />
      )}
    </div>
  );
}
