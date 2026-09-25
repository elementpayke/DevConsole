"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { FiatBreakdown } from "@/components/dashboard/FiatBreakdown";
import { CryptoBreakdownTable } from "@/components/dashboard/CryptoBreakdownTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MerchantWalletBanner } from "@/components/merchant/MerchantWalletBanner";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { getDashboardStats } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { isMerchant } = useMerchantExperience();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getDashboardStats()
      .then((dashboard) => {
        if (cancelled) return;
        setStats(dashboard);
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

  return (
    <>
      <Header title="Overview" showOperational />
      <div className="p-7">
        {isMerchant && <MerchantWalletBanner />}
        <h1 className="mb-1 text-[22px] font-extrabold tracking-tight">
          Welcome back{firstName !== "there" ? `, ${firstName}` : ""}
        </h1>
        <p className="mb-6 text-sm text-muted">
          Here&apos;s what&apos;s moving through your ElementPay account.
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading dashboard…</p>
        ) : stats ? (
          <>
            <div
              className={`mb-6 grid gap-3.5 ${isMerchant ? "grid-cols-4" : "grid-cols-5"}`}
            >
              <StatCard label="Total transactions" value={stats.summary.total_transactions} />
              <StatCard label="Pending" value={stats.summary.pending_orders} />
              <StatCard label="Settled" value={stats.summary.settled_orders} />
              <StatCard label="Fiat currencies" value={stats.summary.total_currencies} />
              {!isMerchant && (
                <StatCard label="Crypto tokens" value={stats.summary.total_tokens} />
              )}
            </div>

            <div
              className={`mb-6 grid gap-4 ${isMerchant ? "grid-cols-1" : "grid-cols-[1fr_1.4fr]"}`}
            >
              <FiatBreakdown breakdown={stats.fiat_breakdown} />
              {!isMerchant && <CryptoBreakdownTable breakdown={stats.crypto_breakdown} />}
            </div>

            <QuickActions isMerchant={isMerchant} />
          </>
        ) : null}
      </div>
    </>
  );
}
