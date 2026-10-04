"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function TopUpModal({ address, onClose }: { address: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Modal onClose={onClose} width={440}>
      <div className="mb-1 text-[17px] font-bold">Top up your wallet</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Send USDC on the Base network to this address. Funds usually arrive within a minute.
      </p>
      {address ? (
        <>
          <div
            className="mono mb-3 rounded-lg p-3 text-[13px] break-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {address}
          </div>
          <div
            className="mb-4 rounded-lg p-3 text-[12px]"
            style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
          >
            Only send USDC on Base. Other tokens or networks may be lost.
          </div>
          <Button type="button" className="w-full" onClick={copy}>
            {copied ? "Copied" : "Copy address"}
          </Button>
        </>
      ) : (
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>
          Link a wallet first from Account setup before topping up.
        </p>
      )}
    </Modal>
  );
}
