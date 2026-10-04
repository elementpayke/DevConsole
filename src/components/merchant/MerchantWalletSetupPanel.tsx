"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Button } from "@/components/ui/Button";
import { connectLinkedWallet, listLinkedWallets } from "@/lib/api/wallets";
import { ApiError } from "@/lib/api/client";
import {
  MERCHANT_TREASURY_CHAIN,
  TREASURY_CHAIN_OPTIONS,
  isTreasuryChainId,
  selectMerchantTreasuryWallet,
  type LinkedWallet,
  type TreasuryChainId,
} from "@/lib/merchantWallet";

type CreateMode = "loading" | "privy" | "local";

function embeddedAddress(wallets: ReturnType<typeof useWallets>["wallets"]) {
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  return embedded?.address?.trim() ?? null;
}

function chainLabel(id: TreasuryChainId) {
  return TREASURY_CHAIN_OPTIONS.find((c) => c.id === id)?.label ?? id;
}

export function MerchantWalletSetupPanel() {
  const router = useRouter();
  const { authenticated, ready, createWallet } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  const [mode, setMode] = useState<CreateMode>("loading");
  const [chain, setChain] = useState<TreasuryChainId>(MERCHANT_TREASURY_CHAIN);
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingLink, setPendingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const embeddedAddr = embeddedAddress(privyWallets);

  const fetchTreasuryWallet = useCallback(async () => {
    const res = await listLinkedWallets();
    const rows = Array.isArray(res.data) ? res.data : [];
    return selectMerchantTreasuryWallet(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const treasury = await fetchTreasuryWallet();
        if (cancelled) return;
        setLinked(treasury);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load account status",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const res = await fetch("/api/auth/privy-token", {
          method: "POST",
          credentials: "include",
        });
        if (cancelled) return;
        setMode(res.ok ? "privy" : "local");
      } catch {
        if (!cancelled) setMode("local");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTreasuryWallet]);

  useEffect(() => {
    if (!pendingLink || mode !== "privy") return;
    if (!embeddedAddr) {
      const timeout = window.setTimeout(() => {
        setError("Wallet creation is taking longer than expected. Refresh and try again.");
        setPendingLink(false);
        setBusy(false);
      }, 60_000);
      return () => window.clearTimeout(timeout);
    }

    let cancelled = false;
    (async () => {
      try {
        await connectLinkedWallet({ address: embeddedAddr, chain });
        if (cancelled) return;
        const treasury = await fetchTreasuryWallet();
        if (cancelled) return;
        setLinked(treasury);
        setPendingLink(false);
        router.push("/wallets");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not register wallet with ElementPay",
        );
        setPendingLink(false);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingLink, embeddedAddr, chain, mode, fetchTreasuryWallet, router]);

  async function handlePrivyCreate() {
    setBusy(true);
    setError(null);
    try {
      if (!ready || !authenticated) {
        throw new Error(
          "Signing you into wallet setup… wait a moment, then try Create wallet again.",
        );
      }
      if (!embeddedAddress(privyWallets)) {
        await createWallet();
      }
      setPendingLink(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Wallet creation failed",
      );
      setBusy(false);
    }
  }

  async function handleLocalCreate() {
    setBusy(true);
    setError(null);
    setCreatedSecret(null);
    try {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      await connectLinkedWallet({ address: account.address, chain });
      setCreatedSecret(privateKey);
      const treasury = await fetchTreasuryWallet();
      setLinked(treasury);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not register wallet with ElementPay",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading || mode === "loading") {
    return <p className="text-sm text-muted">Loading account status…</p>;
  }

  if (linked && createdSecret) {
    return (
      <section className="rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-bold">Wallet created</h2>
        <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>
          Registered on <strong style={{ color: "var(--ink)" }}>{chainLabel(chain)}</strong> via{" "}
          <span className="mono text-[12px]">/auth/connect-wallet</span>.
        </p>
        <p className="mono mt-3 text-xs break-all">{linked.address}</p>
        <div
          className="mt-4 rounded-lg p-3 text-[12.5px] leading-relaxed"
          style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
        >
          Save this private key now — ElementPay does not store it. Needed to sign from this
          wallet outside Privy (sandbox fallback).
          <p className="mono mt-2 mb-0 break-all select-all">{createdSecret}</p>
        </div>
        <Button className="mt-4 w-full" onClick={() => router.push("/wallets")}>
          Go to wallets
        </Button>
      </section>
    );
  }

  if (linked) {
    return (
      <section className="rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Your ElementPay payout wallet</p>
        <p className="mono mt-2 text-xs break-all">{linked.address}</p>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
          Chain: <span className="font-semibold" style={{ color: "var(--ink)" }}>{linked.chain}</span>
          {" · "}
          Status: {linked.status}
        </p>
        <Button className="mt-4" onClick={() => router.push("/wallets")}>
          Back to wallets
        </Button>
      </section>
    );
  }

  const privyReady = mode === "privy" && ready && authenticated;

  return (
    <section className="rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold">Create your payout wallet</h2>
      <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>
        {mode === "privy"
          ? "Creates an embedded Privy wallet, then registers it with ElementPay for collections and Off-ramp."
          : "Sandbox Privy sign-in is unavailable, so we create a local key and register the address with ElementPay (same connect-wallet API)."}
      </p>

      <label className="mt-4 flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
        Chain
        <select
          value={chain}
          onChange={(e) => {
            const next = e.target.value;
            if (isTreasuryChainId(next)) setChain(next);
          }}
          disabled={busy}
          className="rounded-lg px-3 py-2.5 text-[13.5px] font-normal"
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--panel-solid)",
            color: "var(--ink)",
          }}
        >
          {TREASURY_CHAIN_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="mt-3 text-[12.5px] font-medium" style={{ color: "var(--bad-text)" }}>{error}</p>
      )}

      <Button
        className="mt-4 w-full"
        disabled={busy || (mode === "privy" && !privyReady)}
        onClick={() => void (mode === "privy" ? handlePrivyCreate() : handleLocalCreate())}
      >
        {busy
          ? "Creating…"
          : `Create wallet on ${chainLabel(chain)}`}
      </Button>

      {mode === "privy" && !privyReady && (
        <p className="mt-2 text-[12px]" style={{ color: "var(--faint)" }}>
          Connecting wallet provider…
        </p>
      )}
      {mode === "local" && (
        <p className="mt-2 text-[12px]" style={{ color: "var(--faint)" }}>
          Using local create fallback (sandbox). You will be shown a one-time private key after
          success.
        </p>
      )}
    </section>
  );
}
