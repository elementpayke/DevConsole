"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { connectLinkedWallet, listLinkedWallets } from "@/lib/api/wallets";
import { ApiError } from "@/lib/api/client";
import {
  MERCHANT_TREASURY_CHAIN,
  selectMerchantTreasuryWallet,
  type LinkedWallet,
} from "@/lib/merchantWallet";

function embeddedAddress(wallets: ReturnType<typeof useWallets>["wallets"]) {
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  return embedded?.address?.trim() ?? null;
}

export function MerchantWalletSetupPanel() {
  const router = useRouter();
  const { authenticated, ready, createWallet } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingLink, setPendingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embeddedAddr = embeddedAddress(privyWallets);

  const fetchTreasuryWallet = useCallback(async () => {
    const res = await listLinkedWallets();
    const rows = Array.isArray(res.data) ? res.data : [];
    return selectMerchantTreasuryWallet(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchTreasuryWallet()
      .then((treasury) => {
        if (!cancelled) {
          setLinked(treasury);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load account status",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchTreasuryWallet]);

  useEffect(() => {
    if (!pendingLink) return;
    if (!embeddedAddr) {
      const timeout = window.setTimeout(() => {
        setError(
          "Account setup is taking longer than expected. Refresh the page and try again.",
        );
        setPendingLink(false);
        setBusy(false);
      }, 60_000);
      return () => window.clearTimeout(timeout);
    }

    let cancelled = false;
    (async () => {
      try {
        await connectLinkedWallet({
          address: embeddedAddr,
          chain: MERCHANT_TREASURY_CHAIN,
        });
        if (cancelled) return;
        const treasury = await fetchTreasuryWallet();
        if (cancelled) return;
        setLinked(treasury);
        setPendingLink(false);
        router.push("/dashboard");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Setup failed",
        );
        setPendingLink(false);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingLink, embeddedAddr, fetchTreasuryWallet, router]);

  async function handleSetup() {
    setBusy(true);
    setError(null);
    try {
      if (!ready || !authenticated) {
        throw new Error("Account setup is still starting. Try again in a moment.");
      }

      if (embeddedAddress(privyWallets)) {
        setPendingLink(true);
        return;
      }

      await createWallet();
      setPendingLink(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Setup failed",
      );
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading account status…</p>;
  }

  if (linked) {
    return (
      <GlassCard className="p-5">
        <p className="text-sm text-muted">Your ElementPay payment account</p>
        <p className="mono mt-2 break-all text-xs">{linked.address}</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <h2 className="text-lg font-bold">Set up your payment account</h2>
      <p className="mt-2 text-[13px] text-muted">
        ElementPay uses this account for your collections and Off-ramp withdrawals. If you
        already use ElementPay with the same email, we reuse your existing account.
      </p>
      {error && (
        <p className="mt-3 text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>
      )}
      <Button
        className="mt-4"
        disabled={busy || !ready}
        onClick={() => void handleSetup()}
      >
        {busy ? "Setting up…" : "Activate account"}
      </Button>
    </GlassCard>
  );
}
