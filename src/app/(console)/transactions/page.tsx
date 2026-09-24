"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  DEFAULT_FILTERS,
  TransactionFilters,
  orderInDateRange,
  resolveDateRange,
  type Filters,
} from "@/components/transactions/TransactionFilters";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionDrawer } from "@/components/transactions/TransactionDrawer";
import { ExportOrdersButtons } from "@/components/transactions/ExportOrdersButtons";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { useEnvironment } from "@/lib/env/EnvContext";
import { listMyOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/lib/types";

export default function TransactionsPage() {
  const { isAuthenticated } = useAuth();
  const { isMerchant } = useMerchantExperience();
  const { environment } = useEnvironment();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    // Re-shows the loading state on every filter change, not just on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listMyOrders({
      status_filter: filters.status === "all" ? undefined : filters.status,
      order_type: filters.orderType === "all" ? undefined : filters.orderType,
    })
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load orders.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, filters.status, filters.orderType]);

  const tokens = useMemo(
    () => Array.from(new Set(orders.map((o) => o.token))).sort(),
    [orders],
  );

  const dateRange = useMemo(() => resolveDateRange(filters), [filters]);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return orders.filter((o) => {
      if (!isMerchant && filters.token !== "all" && o.token !== filters.token) return false;
      if (!orderInDateRange(o.created_at, dateRange)) return false;
      if (!search) return true;
      return (
        o.order_id.toLowerCase().includes(search) ||
        (o.phone_number ?? "").toLowerCase().includes(search)
      );
    });
  }, [orders, filters.search, filters.token, dateRange, isMerchant]);

  return (
    <>
      <Header title="Transactions" />
      <div className="p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[22px] font-extrabold tracking-tight">Orders</h1>
          <div className="flex flex-wrap items-center gap-2.5">
            <TransactionFilters
              filters={filters}
              onChange={setFilters}
              tokens={tokens}
              fiatFirst={isMerchant}
            />
            <ExportOrdersButtons
              orders={filtered}
              environment={environment}
              periodLabel={dateRange.label}
              loading={loading}
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading orders…</p>
        ) : (
          <TransactionsTable
            orders={filtered}
            onSelect={setSelected}
            fiatFirst={isMerchant}
          />
        )}
      </div>

      {selected && (
        <TransactionDrawer
          order={selected}
          onClose={() => setSelected(null)}
          fiatFirst={isMerchant}
        />
      )}
    </>
  );
}
