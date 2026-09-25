"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listLinkedWallets } from "@/lib/api/wallets";
import { selectMerchantTreasuryWallet, type LinkedWallet } from "@/lib/merchantWallet";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

type BannerState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "linked" }
  | { kind: "error" };

export function MerchantWalletBanner() {
  const { isMerchant } = useMerchantExperience();
  const [state, setState] = useState<BannerState>({ kind: "loading" });

  useEffect(() => {
    if (!isMerchant) return;
    let cancelled = false;
    setState({ kind: "loading" });
    listLinkedWallets()
      .then((res) => {
        const rows = (res as { data?: LinkedWallet[] }).data ?? [];
        const treasury = selectMerchantTreasuryWallet(rows);
        if (!cancelled) {
          setState(treasury ? { kind: "linked" } : { kind: "missing" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [isMerchant]);

  if (!isMerchant || state.kind !== "missing") return null;

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
      Finish payment account setup before using Off-ramp.{" "}
      <Link href="/account/setup" className="font-bold underline">
        Set up account
      </Link>
    </div>
  );
}
