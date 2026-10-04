"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/**
 * Cross-chain transfers between a merchant's own wallets are not backed by the
 * aggregator yet — show an honest unavailable state (no fake submit / email).
 */
export function WalletTransferModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} width={440}>
      <div className="mb-1 text-[17px] font-bold">Wallet transfer</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Move balance between your own wallets on different chains.
      </p>
      <div
        className="mb-4 rounded-lg p-3 text-[12px]"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Not available yet — cross-chain wallet transfers are not supported in the Console.
        No request is sent and no funds will move.
      </div>
      <Button type="button" className="w-full" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}
