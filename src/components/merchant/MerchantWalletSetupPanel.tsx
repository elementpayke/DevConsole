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

  const refreshLinked = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await listLinkedWallets()) as { data?: LinkedWallet[] };
      const rows = Array.isArray(res?.data) ? res.data : [];
      setLinked(selectMerchantTreasuryWallet(rows));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLinked();
  }, [refreshLinked]);

  useEffect(() => {
    if (!pendingLink) return;
    const address = embeddedAddress(privyWallets);
    if (!address) {
      const timeout = window.setTimeout(() => {
        setError(
          "Wallet creation is taking longer than expected. Refresh the page and try again.",
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
          address,
          chain: MERCHANT_TREASURY_CHAIN,
        });
        if (cancelled) return;
        await refreshLinked();
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
  }, [pendingLink, privyWallets, refreshLinked, router]);

  async function handleSetup() {
    setBusy(true);
    setError(null);
    try {
      if (!ready || !authenticated) {
        throw new Error("Wallet service is still starting. Try again in a moment.");
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
    return <p className="text-sm text-muted">Loading wallet status…</p>;
  }

  if (linked) {
    return (
      <GlassCard className="p-5">
        <p className="text-sm text-muted">Merchant treasury wallet</p>
        <p className="mono mt-2 break-all text-xs">{linked.address}</p>
        <p className="mt-2 text-[12px] text-faint">Chain: {linked.chain}</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <h2 className="text-lg font-bold">Set up your treasury wallet</h2>
      <p className="mt-2 text-[13px] text-muted">
        One embedded wallet on Base holds USDC for Off-ramp. If you already use ElementPay
        with the same email, your existing embedded wallet is reused (Privy allows one
        embedded wallet per account).
      </p>
      {error && (
        <p className="mt-3 text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>
      )}
      <Button
        className="mt-4"
        disabled={busy || !ready}
        onClick={() => void handleSetup()}
      >
        {busy ? "Setting up…" : "Create or link wallet"}
      </Button>
    </GlassCard>
  );
}
