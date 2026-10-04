"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { listLinkedWallets } from "@/lib/api/wallets";
import { listMyOrders } from "@/lib/api/orders";
import { selectMerchantTreasuryWallet, type LinkedWallet } from "@/lib/merchantWallet";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { TopUpModal } from "@/components/wallets/TopUpModal";
import { WalletTransferModal } from "@/components/wallets/WalletTransferModal";

type Balance = { balance_usdc: number | null; has_account: boolean; balance_status: string };

export default function WalletsPage() {
  const { partnerCustomerId } = useMerchantExperience();
  const [wallet, setWallet] = useState<LinkedWallet | null | undefined>(undefined);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [movements, setMovements] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"topup" | "transfer" | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLinkedWallets()
      .then((res) => {
        if (cancelled) return;
        setWallet(selectMerchantTreasuryWallet(res.data ?? []));
      })
      .catch((err) => {
        if (!cancelled) {
          setWallet(null);
          setError(err instanceof ApiError ? err.message : "Failed to load wallet.");
        }
      });

    fetch("/api/merchant/payment-account/balance")
      .then((r) => {
        if (!r.ok) throw new Error(`balance ${r.status}`);
        return r.json();
      })
      .then((json) => !cancelled && setBalance(json?.data ?? null))
      .catch(() => {
        if (!cancelled) setBalance(null);
      });

    listMyOrders({ order_type: "offramp" })
      .then((orders) => !cancelled && setMovements(orders.slice(0, 8)))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const needsVault = !partnerCustomerId;
  const needsWallet = wallet === null;

  const balanceLabel =
    balance?.balance_status === "ok" && balance.balance_usdc != null
      ? `$${balance.balance_usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : wallet
        ? "—"
        : "No wallet linked";

  return (
    <>
      <Header title="Wallets" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        {error && (
          <p className="rounded-lg border p-3 text-[13px]" style={{ borderColor: "var(--border-strong)", background: "var(--panel)", color: "var(--bad-text)" }}>
            {error}
          </p>
        )}

        {(needsVault || needsWallet) && (
          <div
            className="flex flex-wrap items-center gap-3 rounded-lg px-3.5 py-3 text-[12.5px] leading-relaxed"
            style={{ background: "var(--warn-bg)", color: "var(--warn-text)", maxWidth: 720 }}
          >
            <span className="min-w-0 flex-1">
              {needsWallet
                ? "Link a payout wallet to collect and withdraw. Same setup for developers and merchants."
                : "Attach a vault customer to unlock live balances and Off-ramp payouts."}
            </span>
            <Link
              href={needsWallet ? "/account/setup" : "/settings"}
              className="shrink-0 rounded-lg px-3 py-2 text-[12.5px] font-bold no-underline"
              style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
            >
              {needsWallet ? "Link wallet" : "Open Settings"}
            </Link>
          </div>
        )}

        <Link
          href="/otc"
          className="order-last flex flex-wrap items-center gap-3.5 rounded-xl p-4 no-underline"
          style={{ border: "1px dashed var(--border-strong)", background: "var(--surface-soft)", color: "var(--ink)" }}
        >
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
          >
            ⇄
          </span>
          <span className="flex min-w-[180px] flex-1 flex-col gap-0.5">
            <span className="text-[13.5px] font-bold">Moving $20,000 or more?</span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>Get a firm price from the OTC desk.</span>
          </span>
          <span className="text-[12.5px] font-bold" style={{ color: "var(--indigo-text)" }}>OTC desk →</span>
        </Link>

        <div className="flex flex-wrap gap-4">
          <div
            className="flex min-w-[260px] flex-1 flex-col gap-4 rounded-xl p-[22px]"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                USDC on Base
              </span>
              <span className="mono text-[38px] leading-none font-bold">{balanceLabel}</span>
              <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                {wallet ? "This is your treasury wallet for Off-ramp." : "Link a wallet to fund withdrawals."}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setModal("topup")}
                className="flex-1 rounded-lg px-4 py-2.5 text-[13px] font-bold"
                style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
              >
                Top up
              </button>
              <Link
                href="/offramp"
                className="flex-1 rounded-lg px-4 py-2.5 text-center text-[13px] font-semibold no-underline"
                style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--ink)" }}
              >
                Send payout
              </Link>
              <button
                type="button"
                onClick={() => setModal("transfer")}
                className="flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold"
                style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--ink)" }}
              >
                Wallet transfer
              </button>
            </div>
          </div>

          <div
            className="flex min-w-[220px] flex-1 flex-col gap-3 rounded-xl p-5"
            style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
          >
            <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              Wallet details
            </span>
            <Fact label="Network" value="Base" />
            <Fact label="Address" value={wallet ? `${wallet.address.slice(0, 10)}…${wallet.address.slice(-6)}` : "—"} mono />
            <Fact label="Status" value={wallet ? wallet.status : "Not linked"} />
            <Link href="/account/setup" className="mt-auto text-[12.5px] font-bold no-underline" style={{ color: "var(--indigo)" }}>
              Change payout destination
            </Link>
          </div>
        </div>

        <section className="flex flex-col">
          <div className="flex items-baseline gap-3 pb-2.5" style={{ borderBottom: "1px solid var(--border-strong)" }}>
            <h2 className="m-0 text-[15px] font-bold">Recent movements</h2>
            <Link href="/transactions" className="ml-auto text-[12.5px] font-bold no-underline" style={{ color: "var(--indigo)" }}>
              All transactions →
            </Link>
          </div>
          {movements.length === 0 ? (
            <div className="px-2 py-8 text-center text-[13px]" style={{ color: "var(--muted)" }}>
              No off-ramp movements yet.
            </div>
          ) : (
            movements.map((m) => (
              <div key={m.order_id} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold">
                    {m.receiver_name ?? m.phone_number ?? m.order_id.slice(0, 10)}
                  </span>
                  <span className="truncate text-[11.5px]" style={{ color: "var(--faint)" }}>
                    {new Date(m.created_at).toLocaleDateString()} · {m.status}
                  </span>
                </span>
                <span className="mono text-[13px] font-semibold whitespace-nowrap">
                  −{m.amount_crypto.toLocaleString()} USDC
                </span>
              </div>
            ))
          )}
        </section>
      </div>

      {modal === "topup" && <TopUpModal address={wallet?.address ?? null} onClose={() => setModal(null)} />}
      {modal === "transfer" && <WalletTransferModal onClose={() => setModal(null)} />}
    </>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{label}</span>
      <span className={mono ? "mono text-[13px]" : "text-[13px] font-medium"}>{value}</span>
    </div>
  );
}
