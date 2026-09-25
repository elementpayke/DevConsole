"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listLinkedWallets } from "@/lib/api/wallets";
import { selectMerchantTreasuryWallet, type LinkedWallet } from "@/lib/merchantWallet";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

export function MerchantWalletBanner() {
  const { isMerchant } = useMerchantExperience();
  const [wallet, setWallet] = useState<LinkedWallet | null | undefined>(undefined);

  useEffect(() => {
    if (!isMerchant) return;
    let cancelled = false;
    listLinkedWallets()
      .then((res) => {
        const rows = (res as { data?: LinkedWallet[] }).data ?? [];
        if (!cancelled) setWallet(selectMerchantTreasuryWallet(rows));
      })
      .catch(() => {
        if (!cancelled) setWallet(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isMerchant]);

  if (!isMerchant || wallet === undefined || wallet !== null) return null;

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
      Set up your treasury wallet before using Off-ramp.{" "}
      <Link href="/wallet/setup" className="font-bold underline">
        Set up wallet
      </Link>
    </div>
  );
}
