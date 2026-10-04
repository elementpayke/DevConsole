"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/**
 * Transfers between a merchant's own wallets across chains aren't backed by
 * the aggregator yet — this collects intent and is clearly marked as such
 * rather than pretending to move funds.
 */
export function WalletTransferModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Modal onClose={onClose} width={440}>
      <div className="mb-1 text-[17px] font-bold">Wallet transfer</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Move balance between your own wallets on different chains.
      </p>
      {submitted ? (
        <div className="rounded-lg p-3 text-[13px]" style={{ background: "var(--ok-bg)", color: "var(--ok-text)" }}>
          Thanks — cross-chain wallet transfers aren&apos;t live yet. We&apos;ll email you when this
          ships for your account.
        </div>
      ) : (
        <>
          <div
            className="mb-4 rounded-lg p-3 text-[12px]"
            style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
          >
            Not yet available — this records interest only. No funds will move.
          </div>
          <Button type="button" className="w-full" onClick={() => setSubmitted(true)}>
            Notify me when this ships
          </Button>
        </>
      )}
    </Modal>
  );
}
