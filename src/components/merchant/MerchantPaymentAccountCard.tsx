"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { listLinkedWallets } from "@/lib/api/wallets";
import { selectMerchantTreasuryWallet, type LinkedWallet } from "@/lib/merchantWallet";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

const USDC_BASE =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function MerchantPaymentAccountCard() {
  const { isMerchant } = useMerchantExperience();
  const [account, setAccount] = useState<LinkedWallet | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isMerchant) return;
    let cancelled = false;
    listLinkedWallets()
      .then((res) => {
        if (!cancelled) {
          setAccount(selectMerchantTreasuryWallet(res.data ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isMerchant]);

  if (!isMerchant || account === undefined) return null;

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <GlassCard className="mb-5 p-[22px]">
      <div className="mb-0.5 text-[14.5px] font-bold">Payment account</div>
      <div className="mb-4 text-[12.5px] text-subtle">
        Send USDC on Base to this address to fund withdrawals (Off-ramp). Use only
        USDC on the Base network.
      </div>
      {account ? (
        <>
          <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">
            Deposit address (Base)
          </div>
          <p className="mono break-all text-[13px]">{account.address}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="w-fit"
              onClick={() => void copyAddress(account.address)}
            >
              {copied ? "Copied" : "Copy address"}
            </Button>
            <span className="text-[11px] text-muted">
              Token: USDC ({USDC_BASE.slice(0, 10)}…)
            </span>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-muted">
          No payment account linked yet.{" "}
          <Link href="/account/setup" className="font-bold underline">
            Set up account
          </Link>{" "}
          before funding or withdrawing.
        </p>
      )}
    </GlassCard>
  );
}
