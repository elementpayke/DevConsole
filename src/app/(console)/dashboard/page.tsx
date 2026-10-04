"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MerchantWalletBanner } from "@/components/merchant/MerchantWalletBanner";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { getDashboardStats } from "@/lib/api/dashboard";
import { listMyOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { statusStyle } from "@/lib/theme";
import type { CurrencyStats, DashboardStats, Order } from "@/lib/types";

/** Local-calendar day key (not UTC) so "today" matches the merchant's own clock. */
function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function last14Days() {
  const days: string[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

/** Highest total_volume currency from dashboard stats (all-time aggregates). */
function primaryFiatFromStats(
  breakdown: Record<string, CurrencyStats>,
): { currency: string; stats: CurrencyStats } | null {
  let best: { currency: string; stats: CurrencyStats } | null = null;
  for (const [currency, stats] of Object.entries(breakdown)) {
    if (!best || stats.total_volume > best.stats.total_volume) {
      best = { currency, stats };
    }
  }
  return best;
}

/** Most frequent currency among recent orders — the chart only sums same-currency amounts. */
function primaryCurrency(orders: Order[]): string | null {
  const counts = new Map<string, number>();
  for (const o of orders) counts.set(o.currency, (counts.get(o.currency) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { isMerchant } = useMerchantExperience();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersFailed, setOrdersFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    Promise.all([
      getDashboardStats(),
      listMyOrders()
        .then((list) => {
          if (!cancelled) setOrdersFailed(false);
          return list;
        })
        .catch(() => {
          if (!cancelled) setOrdersFailed(true);
          return [] as Order[];
        }),
    ])
      .then(([dashboard, orderList]) => {
        if (cancelled) return;
        setStats(dashboard);
        setOrders(orderList);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const firstName = user?.email?.split("@")[0] ?? "there";
  const isFresh = (stats?.summary.total_transactions ?? 0) === 0;

  const chart = useMemo(() => {
    const days = last14Days();
    // Prefer the dashboard's highest-volume fiat so the sparkline matches Total volume.
    const fromStats = stats ? primaryFiatFromStats(stats.fiat_breakdown)?.currency : null;
    const currency = fromStats ?? primaryCurrency(orders ?? []);
    const totals = new Map<string, number>();
    for (const day of days) totals.set(day, 0);
    for (const o of orders ?? []) {
      if (currency && o.currency !== currency) continue;
      const key = dayKey(new Date(o.created_at));
      if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + o.amount_fiat);
    }
    const values = days.map((d) => totals.get(d) ?? 0);
    const max = Math.max(1, ...values);
    return { days, values, max, currency };
  }, [orders, stats]);

  const recent = (orders ?? []).slice(0, 6);

  return (
    <>
      <Header title="Overview" showOperational />
      <div className="p-5 md:p-7">
        {isMerchant && <MerchantWalletBanner />}

        {loading ? (
          <p className="text-sm text-muted">Loading dashboard…</p>
        ) : error ? (
          <p className="rounded-lg border p-3 text-[13px]" style={{ borderColor: "var(--border-strong)", background: "var(--panel)", color: "var(--bad-text)" }}>
            {error}
          </p>
        ) : stats && isFresh ? (
          <FreshOverview firstName={firstName} kycVerified={Boolean(user?.kyc_verified)} />
        ) : stats ? (
          <FullOverview stats={stats} chart={chart} recent={recent} ordersFailed={ordersFailed} isMerchant={isMerchant} />
        ) : null}
      </div>
    </>
  );
}

function FreshOverview({ firstName, kycVerified }: { firstName: string; kycVerified: boolean }) {
  const steps = [
    { title: "Create an API key", note: "Needed to accept your first payment.", href: "/api-keys", cta: "Create key" },
    { title: "Try a test payment", note: "Simulate checkout with pretend money.", href: "/reference", cta: "View API" },
    { title: "Set your payout destination", note: "Where real money lands once you go live.", href: "/profile", cta: "Set up" },
  ];

  return (
    <div className="flex max-w-[980px] flex-col gap-4">
      <section
        className="relative overflow-hidden rounded-2xl px-6 py-7"
        style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
      >
        <span
          className="pointer-events-none absolute -top-14 -right-12 h-56 w-56 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <span className="relative mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: "rgba(255,255,255,0.16)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#ffd166" }} />
          Test mode · pretend money
        </span>
        <h1 className="relative m-0 text-[28px] leading-tight font-extrabold">Welcome, {firstName}</h1>
        <p className="relative mt-1 max-w-[52ch] text-sm opacity-90">
          You&apos;re set up in test mode. Create a key, send yourself a test payment, then verify your
          business when you&apos;re ready to accept real money.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="px-[18px] pt-4 pb-3 text-[15px] font-bold">Start here</div>
          {steps.map((s, i) => (
            <div key={s.href} className="flex items-center gap-3 px-[18px] py-3.5 flex-wrap" style={{ borderTop: "1px solid var(--line)" }}>
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ border: "1.5px solid var(--border-strong)", color: "var(--muted)" }}
              >
                {i + 1}
              </span>
              <span className="min-w-[160px] flex-1">
                <span className="block text-[13.5px] font-semibold">{s.title}</span>
                <span className="block text-xs" style={{ color: "var(--muted)" }}>{s.note}</span>
              </span>
              <Link
                href={s.href}
                className="rounded-lg px-3 py-2 text-[12.5px] font-semibold no-underline"
                style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--ink)" }}
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-xl p-[18px]" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="text-[15px] font-bold">Ready for real money?</div>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            {kycVerified
              ? "Your business is verified — live payments are enabled."
              : "Verify your business to start accepting real payments. Test mode stays open meanwhile."}
          </p>
          {!kycVerified && (
            <Link
              href="/profile"
              className="self-start rounded-lg px-3.5 py-2.5 text-[13px] font-semibold no-underline"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--ink)" }}
            >
              Start verification
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}

function FullOverview({
  stats,
  chart,
  recent,
  ordersFailed,
  isMerchant,
}: {
  stats: DashboardStats;
  chart: { days: string[]; values: number[]; max: number; currency: string | null };
  recent: Order[];
  ordersFailed: boolean;
  isMerchant: boolean;
}) {
  const kpis = [
    { label: "Total transactions", value: stats.summary.total_transactions },
    { label: "Pending", value: stats.summary.pending_orders },
    { label: "Settled", value: stats.summary.settled_orders },
    { label: "Fiat currencies", value: stats.summary.total_currencies },
    ...(!isMerchant ? [{ label: "Crypto tokens", value: stats.summary.total_tokens }] : []),
  ];

  const todayTotal = chart.values[chart.values.length - 1] ?? 0;
  const last14Total = chart.values.reduce((sum, v) => sum + v, 0);
  const primaryFiat = primaryFiatFromStats(stats.fiat_breakdown);
  const fiatEntries = Object.entries(stats.fiat_breakdown).sort(
    (a, b) => b[1].total_volume - a[1].total_volume,
  );

  return (
    <div className="flex flex-col gap-5">
      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(132px, 1fr))` }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-1 rounded-xl px-[18px] py-4"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              {k.label}
            </span>
            <span className="mono text-[26px] leading-none font-bold">{k.value}</span>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
        <div className="flex flex-wrap items-end gap-8 px-[22px] pt-[22px] pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              Total volume
            </span>
            <span className="mono text-[36px] leading-none font-bold">
              {primaryFiat
                ? `${primaryFiat.currency} ${primaryFiat.stats.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : "—"}
            </span>
            <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
              {primaryFiat
                ? `Settled ${primaryFiat.stats.settled_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} · ${primaryFiat.stats.transaction_count.toLocaleString()} orders`
                : "No fiat volume yet"}
            </span>
          </div>
          <div className="flex flex-wrap gap-5 pb-0.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Today
              </span>
              <span className="mono text-[18px] font-bold">
                {chart.currency ? `${chart.currency} ` : ""}
                {todayTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Last 14 days
              </span>
              <span className="mono text-[18px] font-bold">
                {chart.currency ? `${chart.currency} ` : ""}
                {last14Total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1.5 px-[22px]" style={{ height: 120 }}>
          {chart.values.map((v, i) => (
            <span
              key={chart.days[i]}
              title={`${chart.days[i]}: ${v.toLocaleString()}`}
              className="flex-1 rounded-t"
              style={{
                height: `${Math.max(3, (v / chart.max) * 100)}%`,
                background: v > 0 ? "var(--indigo)" : "var(--surface)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between px-[22px] pt-2 pb-4 text-[11px]" style={{ color: "var(--faint)" }}>
          <span>{chart.days[0]}</span>
          <span>
            {chart.currency
              ? `${chart.currency} volume from recent orders`
              : "Fiat volume from recent orders"}
            {" · "}
            {chart.days[chart.days.length - 1]}
          </span>
        </div>
      </section>

      {fiatEntries.length > 0 && (
        <section
          className="overflow-hidden rounded-xl"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <div className="px-4 py-3.5">
            <h2 className="m-0 text-[15px] font-bold">Volume by currency</h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
              Totals from your dashboard stats (all orders), not just the last 14 days.
            </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {fiatEntries.map(([currency, cstats]) => (
              <div
                key={currency}
                className="flex flex-col gap-2 px-4 py-3.5"
                style={{ borderTop: "1px solid var(--line)" }}
              >
                <span className="text-[13.5px] font-bold">{currency}</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>
                      Volume
                    </div>
                    <div className="mono text-[13px] font-bold">
                      {cstats.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>
                      Settled
                    </div>
                    <div className="mono text-[13px] font-bold">
                      {cstats.settled_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>
                      Orders
                    </div>
                    <div className="mono text-[13px] font-bold">{cstats.transaction_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section
        className="overflow-hidden rounded-xl"
        style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <h2 className="m-0 text-[15px] font-bold">Recent activity</h2>
          <Link href="/transactions" className="ml-auto text-[12.5px] font-bold no-underline" style={{ color: "var(--indigo)" }}>
            View all →
          </Link>
        </div>
        {ordersFailed ? (
          <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--bad-text)", borderTop: "1px solid var(--line)" }}>
            Couldn&apos;t load recent activity. Refresh to try again.
          </div>
        ) : recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
            No transactions yet.
          </div>
        ) : (
          recent.map((o) => {
            const style = statusStyle(o.status);
            return (
              <Link
                key={o.order_id}
                href="/transactions"
                className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-2.5 px-4 py-3 no-underline"
                style={{ borderTop: "1px solid var(--line)", color: "var(--ink)" }}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="mono truncate text-[12.5px] font-medium">{o.order_id}</span>
                  <span className="truncate text-[11px]" style={{ color: "var(--faint)" }}>
                    {o.client_ref ?? "—"}
                  </span>
                </span>
                <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                  {o.order_type === 0 ? "On-ramp" : "Off-ramp"}
                </span>
                <span className="mono text-right text-[12.5px] font-medium whitespace-nowrap">
                  {o.currency} {o.amount_fiat.toLocaleString()}
                </span>
                <span
                  className="rounded-full px-2 py-1 text-[11px] font-bold whitespace-nowrap"
                  style={{ background: style.bg, color: style.text }}
                >
                  {o.status}
                </span>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
