import type { OrderTypeQuery } from "@/lib/api/orders";

export type PeriodPreset = "all" | "7d" | "30d" | "month" | "custom";

export type Filters = {
  search: string;
  status: string;
  orderType: OrderTypeQuery | "all";
  token: string;
  period: PeriodPreset;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "all",
  orderType: "all",
  token: "all",
  period: "all",
  dateFrom: "",
  dateTo: "",
};

export type DateRange = {
  from: Date | null;
  to: Date | null;
  label: string;
};

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseLocalDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Resolve the active created_at window from period presets / custom dates. */
export function resolveDateRange(filters: Filters): DateRange {
  const now = new Date();

  switch (filters.period) {
    case "7d": {
      const to = endOfLocalDay(now);
      const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      return { from, to, label: "last 7 days" };
    }
    case "30d": {
      const to = endOfLocalDay(now);
      const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
      return { from, to, label: "last 30 days" };
    }
    case "month": {
      const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), 1));
      const to = endOfLocalDay(now);
      return { from, to, label: "this month" };
    }
    case "custom": {
      const from = filters.dateFrom ? startOfLocalDay(parseLocalDate(filters.dateFrom) ?? new Date(NaN)) : null;
      const to = filters.dateTo ? endOfLocalDay(parseLocalDate(filters.dateTo) ?? new Date(NaN)) : null;
      const fromOk = from && !Number.isNaN(from.getTime()) ? from : null;
      const toOk = to && !Number.isNaN(to.getTime()) ? to : null;
      if (!fromOk && !toOk) return { from: null, to: null, label: "all time" };
      const fromLabel = fromOk ? filters.dateFrom : "…";
      const toLabel = toOk ? filters.dateTo : "…";
      return { from: fromOk, to: toOk, label: `${fromLabel} → ${toLabel}` };
    }
    case "all":
    default:
      return { from: null, to: null, label: "all time" };
  }
}

export function orderInDateRange(createdAt: string, range: DateRange) {
  if (!range.from && !range.to) return true;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  if (range.from && t < range.from.getTime()) return false;
  if (range.to && t > range.to.getTime()) return false;
  return true;
}

export function TransactionFilters({
  filters,
  onChange,
  tokens,
  fiatFirst = false,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  tokens: string[];
  fiatFirst?: boolean;
}) {
  const selectClass =
    "rounded-lg border border-line-strong bg-white px-3.5 py-2.5 font-sans text-[13px]";
  const dateClass =
    "rounded-lg border border-line-strong bg-white px-3 py-2.5 font-sans text-[13px] text-ink";

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
      {!fiatFirst && (
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
      )}
      <select
        value={filters.period}
        onChange={(e) =>
          onChange({
            ...filters,
            period: e.target.value as PeriodPreset,
          })
        }
        className={selectClass}
        aria-label="Date period"
      >
        <option value="all">All time</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="month">This month</option>
        <option value="custom">Custom range</option>
      </select>
      {filters.period === "custom" && (
        <>
          <label className="flex items-center gap-1.5 text-[12px] text-muted">
            From
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              className={dateClass}
            />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted">
            To
            <input
              type="date"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              className={dateClass}
            />
          </label>
        </>
      )}
    </div>
  );
}
