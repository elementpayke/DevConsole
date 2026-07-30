"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { TransactionFilters, type Filters } from "@/components/transactions/TransactionFilters";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionDrawer } from "@/components/transactions/TransactionDrawer";
import { useAuth } from "@/lib/auth/AuthContext";
import { listMyOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/lib/types";

const DEFAULT_FILTERS: Filters = { search: "", status: "all", orderType: "all", token: "all" };

export default function TransactionsPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    // Re-shows the loading state on every filter change, not just on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listMyOrders(accessToken, {
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
  }, [accessToken, filters.status, filters.orderType]);

  const tokens = useMemo(
    () => Array.from(new Set(orders.map((o) => o.token))).sort(),
    [orders],
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filters.token !== "all" && o.token !== filters.token) return false;
      if (!search) return true;
      return (
        o.order_id.toLowerCase().includes(search) ||
        (o.phone_number ?? "").toLowerCase().includes(search)
      );
    });
  }, [orders, filters.search, filters.token]);

  return (
    <>
      <Header title="Transactions" />
      <div className="p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[22px] font-extrabold tracking-tight">Orders</h1>
          <TransactionFilters filters={filters} onChange={setFilters} tokens={tokens} />
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading orders…</p>
        ) : (
          <TransactionsTable orders={filtered} onSelect={setSelected} />
        )}
      </div>

      {selected && <TransactionDrawer order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
