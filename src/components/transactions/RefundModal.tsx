"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createRefundRequest } from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/lib/types";

const SUCCESS_STATUSES = new Set(["pending", "acknowledged"]);

export function RefundModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState<{ message: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await createRefundRequest({ order_id: order.order_id, reason: reason.trim() || undefined });
      setSubmitted({
        message: res.message,
        ok: SUCCESS_STATUSES.has(String(res.status).toLowerCase()),
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Could not record refund request${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} width={440} zIndexClass="z-[1100]">
      <div className="mb-1 text-[17px] font-bold">Refund order</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="mono">{order.order_id.slice(0, 14)}</span> · {order.currency} {order.amount_fiat.toLocaleString()}
      </p>
      {submitted ? (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={
            submitted.ok
              ? { background: "var(--ok-bg)", color: "var(--ok-text)" }
              : { background: "var(--warn-bg)", color: "var(--warn-text)" }
          }
        >
          {submitted.message}
        </div>
      ) : (
        <>
          <div className="mb-3 rounded-lg p-3 text-[12px]" style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}>
            This records a refund request for ops review. Funds are not moved automatically yet.
          </div>
          <label className="mb-4 flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Reason (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="rounded-lg p-2.5 text-[13px] font-normal"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", resize: "vertical", color: "var(--ink)" }}
            />
          </label>
          {error && <p className="mb-3 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
          <Button type="button" className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Submitting…" : "Request refund"}
          </Button>
        </>
      )}
    </Modal>
  );
}
