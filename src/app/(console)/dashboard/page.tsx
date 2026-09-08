"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { FiatBreakdown } from "@/components/dashboard/FiatBreakdown";
import { CryptoBreakdownTable } from "@/components/dashboard/CryptoBreakdownTable";
import { GoLiveTracker } from "@/components/dashboard/GoLiveTracker";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuth } from "@/lib/auth/AuthContext";
import { getDashboardStats } from "@/lib/api/dashboard";
import { listApiKeys } from "@/lib/api/apiKeys";
import { ApiError } from "@/lib/api/client";
import type { ApiKeyInfo, DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    Promise.all([getDashboardStats(), listApiKeys()])
      .then(([dashboard, keys]) => {
        if (cancelled) return;
        setStats(dashboard);
        setApiKeys(keys);
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
  const hasApiKey = apiKeys.length > 0;
  const hasSandboxOrder = (stats?.summary.total_transactions ?? 0) > 0;
  const kycVerified = user?.kyc_verified ?? false;
  const hasLiveKey = apiKeys.some((k) => k.environment === "live");

  const steps = [
    {
      label: "API keys created",
      sub: "Sandbox",
      state: hasApiKey ? ("done" as const) : ("active" as const),
    },
    {
      label: "Sandbox order",
      sub: hasSandboxOrder ? "Completed" : "Not started",
      state: hasSandboxOrder ? ("done" as const) : hasApiKey ? ("active" as const) : ("pending" as const),
    },
    {
      label: "Go-live checklist",
      sub: "KYC verification",
      state: kycVerified ? ("done" as const) : hasSandboxOrder ? ("active" as const) : ("pending" as const),
    },
    {
      label: "Confirm live order",
      sub: "Production",
      state: hasLiveKey ? ("done" as const) : kycVerified ? ("active" as const) : ("pending" as const),
    },
  ];

  return (
    <>
      <Header title="Overview" showOperational />
      <div className="p-7">
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
            <div className="mb-6 grid grid-cols-5 gap-3.5">
              <StatCard label="Total transactions" value={stats.summary.total_transactions} />
              <StatCard label="Pending" value={stats.summary.pending_orders} />
              <StatCard label="Settled" value={stats.summary.settled_orders} />
              <StatCard label="Fiat currencies" value={stats.summary.total_currencies} />
              <StatCard label="Crypto tokens" value={stats.summary.total_tokens} />
            </div>

            <div className="mb-6 grid grid-cols-[1fr_1.4fr] gap-4">
              <FiatBreakdown breakdown={stats.fiat_breakdown} />
              <CryptoBreakdownTable breakdown={stats.crypto_breakdown} />
            </div>

            <GoLiveTracker steps={steps} />
            <QuickActions />
          </>
        ) : null}
      </div>
    </>
  );
}
