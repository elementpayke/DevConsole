"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/lib/types";

/** No refund endpoint exists on the aggregator yet — point merchants at support. */
export function RefundModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const shortId = order.order_id.slice(0, 14);
  const mailto = `mailto:support@elementpay.net?subject=${encodeURIComponent(
    `Refund request for ${order.order_id}`,
  )}&body=${encodeURIComponent(
    `Please refund order ${order.order_id} (${order.currency} ${order.amount_fiat}).\n\nReason:\n`,
  )}`;

  return (
    <Modal onClose={onClose} width={440} zIndexClass="z-[1100]">
      <div className="mb-1 text-[17px] font-bold">Refund order</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="mono">{shortId}</span> · {order.currency} {order.amount_fiat.toLocaleString()}
      </p>
      <div
        className="mb-4 rounded-lg p-3 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Self-serve refunds aren&apos;t available yet. Email ElementPay support with this order ID —
        nothing is submitted from this screen.
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="w-full" onClick={() => window.open(mailto, "_self")}>
          Email support
        </Button>
        <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
