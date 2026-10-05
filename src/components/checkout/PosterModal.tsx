"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function PosterModal({ account, onClose }: { account: string; onClose: () => void }) {
  return (
    <Modal onClose={onClose} width={420}>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[16px] font-bold">Printable poster</span>
      </div>
      <div
        className="mx-auto flex max-w-[320px] flex-col overflow-hidden rounded-2xl"
        style={{ background: "var(--panel-solid)", color: "var(--ink)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col items-center gap-0.5 px-5 py-4 text-center" style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}>
          <span className="text-[13px] font-extrabold tracking-[0.16em]">SCAN OR PAYBILL</span>
          <span className="text-[26px] font-extrabold">Pay with M-Pesa</span>
        </div>
        <div className="flex flex-col items-center gap-3 px-5 py-5 text-center">
          <span className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-extrabold tracking-[0.12em]" style={{ color: "#5b5790" }}>ACCOUNT NUMBER</span>
            <span className="mono rounded-lg px-4 py-2 text-[22px] font-bold tracking-wide" style={{ background: "var(--indigo-tint)" }}>{account}</span>
          </span>
          <span className="text-[10.5px]" style={{ color: "#8a87b0" }}>Powered by ElementPay</span>
        </div>
      </div>
      <Button type="button" className="mt-4 w-full" onClick={() => window.print()}>
        Print poster
      </Button>
    </Modal>
  );
}
