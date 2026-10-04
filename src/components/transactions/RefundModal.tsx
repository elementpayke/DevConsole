"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/lib/types";

/** No refund endpoint exists on the aggregator yet — this records intent only. */
export function RefundModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Modal onClose={onClose} width={440}>
      <div className="mb-1 text-[17px] font-bold">Refund order</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="mono">{order.order_id.slice(0, 14)}</span> · {order.currency} {order.amount_fiat.toLocaleString()}
      </p>
      {submitted ? (
        <div className="rounded-lg p-3 text-[13px]" style={{ background: "var(--ok-bg)", color: "var(--ok-text)" }}>
          Refund request recorded. Our team will process it and update this order&apos;s status.
        </div>
      ) : (
        <>
          <div
            className="mb-3 rounded-lg p-3 text-[12px]"
            style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
          >
            Self-serve refunds aren&apos;t live yet — this opens a request to ElementPay support.
          </div>
          <label className="mb-4 flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Reason (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this being refunded?"
              className="rounded-lg p-2.5 text-[13px]"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", resize: "vertical" }}
            />
          </label>
          <Button type="button" className="w-full" onClick={() => setSubmitted(true)}>
            Request refund
          </Button>
        </>
      )}
    </Modal>
  );
}
