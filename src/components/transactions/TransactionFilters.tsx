import type { OrderTypeQuery } from "@/lib/api/orders";

export type Filters = {
  search: string;
  status: string;
  orderType: OrderTypeQuery | "all";
  token: string;
};

export function TransactionFilters({
  filters,
  onChange,
  tokens,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  tokens: string[];
}) {
  const selectClass =
    "rounded-lg border border-line-strong bg-white px-3.5 py-2.5 font-sans text-[13px]";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <input
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search order ID or phone"
        className="w-[230px] rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13px]"
      />
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className={selectClass}
      >
        <option value="all">All statuses</option>
        <option value="settled">Settled</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>
      <select
        value={filters.orderType}
        onChange={(e) => onChange({ ...filters, orderType: e.target.value as Filters["orderType"] })}
        className={selectClass}
      >
        <option value="all">On/off-ramp</option>
        <option value="offramp">Off-ramp</option>
        <option value="onramp">On-ramp</option>
      </select>
      <select
        value={filters.token}
        onChange={(e) => onChange({ ...filters, token: e.target.value })}
        className={selectClass}
      >
        <option value="all">All tokens</option>
        {tokens.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
