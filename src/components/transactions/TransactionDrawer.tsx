import { Badge } from "@/components/ui/Badge";
import { colors, statusStyle } from "@/lib/theme";
import type { Order } from "@/lib/types";

type TimelineStep = { label: string; time: string; dotColor: string };

function buildTimeline(order: Order): TimelineStep[] {
  const created = new Date(order.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const steps: TimelineStep[] = [{ label: "Order created", time: created, dotColor: colors.faint }];

  if (order.creation_transaction_hash) {
    steps.push({
      label: "Crypto received on-chain",
      time: created,
      dotColor: order.status === "failed" ? colors.faint : colors.success.text,
    });
  }

  if (order.status === "failed") {
    steps.push({ label: "Order failed", time: created, dotColor: colors.danger.text });
  } else if (order.settlement_transaction_hash || order.status === "settled" || order.status === "completed") {
    steps.push({ label: "Fiat disbursed", time: created, dotColor: colors.success.text });
  } else {
    steps.push({ label: "Awaiting settlement", time: created, dotColor: colors.warning.text });
  }

  return steps;
}

export function TransactionDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const style = statusStyle(order.status);
  const timeline = buildTimeline(order);

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[1000] backdrop-blur-sm" style={{ background: "oklch(0.15 0.02 264 / 0.3)" }} />
      <div
        className="solid-card fixed top-0 right-0 z-[1001] h-screen w-[400px] max-w-[92vw] overflow-y-auto rounded-none border-l"
        style={{ boxShadow: "-16px 0 40px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center justify-between border-b border-line px-[22px] py-5">
          <span className="text-[15px] font-extrabold">Order details</span>
          <button onClick={onClose} className="cursor-pointer text-[13px] font-bold text-subtle">
            Close
          </button>
        </div>

        <div className="p-[22px]">
          <div className="mb-5 flex items-center justify-between">
            <span className="mono text-sm font-bold">{order.order_id}</span>
            <Badge bg={style.bg} color={style.text}>
              {order.status}
            </Badge>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <Field label="Token" value={order.token} />
            <Field
              label="Created"
              value={new Date(order.created_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>

          <div className="mb-5 rounded-[10px] border border-line px-[18px] py-4">
            <Row label="Crypto amount" value={order.amount_crypto.toLocaleString()} />
            <Row label="Fiat amount" value={`${order.amount_fiat.toLocaleString()} ${order.currency}`} />
            {order.fee_charged != null && (
              <Row label="Fee charged" value={order.fee_charged.toLocaleString()} last />
            )}
          </div>

          {(order.phone_number || order.receiver_name) && (
            <div className="mb-5">
              <div className="mb-1 text-[11px] font-bold tracking-wide text-faint uppercase">
                Recipient
              </div>
              <div className="mono text-[13px]">{order.receiver_name ?? order.phone_number}</div>
            </div>
          )}

          {order.settlement_transaction_hash && (
            <div className="mb-5">
              <div className="mb-1 text-[11px] font-bold tracking-wide text-faint uppercase">
                Settlement tx hash
              </div>
              <div className="mono text-primary text-xs break-all">
                {order.settlement_transaction_hash}
              </div>
            </div>
          )}

          <div className="mb-5 border-t border-line pt-[18px]">
            <div className="mb-3 text-[12.5px] font-bold">Timeline</div>
            <div className="flex flex-col gap-3">
              {timeline.map((ev, i) => (
                <div key={i} className="flex gap-2.5">
                  <span
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: ev.dotColor }}
                  />
                  <div>
                    <div className="text-[12.5px] font-semibold">{ev.label}</div>
                    <div className="text-[11px] text-faint">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold tracking-wide text-faint uppercase">{label}</div>
      <div className="text-[13.5px] font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between ${last ? "" : "mb-2.5"}`}>
      <span className="text-[12.5px] text-subtle">{label}</span>
      <span className="mono text-[13px] font-bold">{value}</span>
    </div>
  );
}
