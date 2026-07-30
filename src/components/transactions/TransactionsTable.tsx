import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { statusStyle } from "@/lib/theme";
import type { Order } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionsTable({
  orders,
  onSelect,
}: {
  orders: Order[];
  onSelect: (order: Order) => void;
}) {
  return (
    <GlassCard className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse">
        <thead>
          <tr style={{ background: "oklch(0.98 0.003 264)" }}>
            {["Order", "Token", "Crypto amount", "Fiat amount", "Recipient", "Status", "Created"].map(
              (h, i) => (
                <th
                  key={h}
                  className={`px-[18px] py-3 text-[11.5px] font-bold text-faint ${
                    i === 2 || i === 3 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const style = statusStyle(order.status);
            return (
              <tr
                key={order.order_id}
                onClick={() => onSelect(order)}
                className="cursor-pointer hover:bg-[oklch(0.98_0.003_264)]"
              >
                <td className="mono border-t border-line-soft px-[18px] py-3.5 text-[12.5px] font-semibold">
                  {order.order_id.slice(0, 10)}
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-[13px] font-semibold">
                  {order.token}
                </td>
                <td className="mono border-t border-line-soft px-[18px] py-3.5 text-right text-[12.5px]">
                  {order.amount_crypto.toLocaleString()}
                </td>
                <td className="mono border-t border-line-soft px-[18px] py-3.5 text-right text-[12.5px] font-bold">
                  {order.amount_fiat.toLocaleString()} {order.currency}
                </td>
                <td className="mono border-t border-line-soft px-[18px] py-3.5 text-[12px] text-muted">
                  {order.phone_number ?? order.wallet_address?.slice(0, 10) ?? "—"}
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5">
                  <Badge bg={style.bg} color={style.text}>
                    {order.status}
                  </Badge>
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-[12px] text-muted">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="p-10 text-center text-[13px] text-subtle">No orders match your filters.</div>
      )}
    </GlassCard>
  );
}
