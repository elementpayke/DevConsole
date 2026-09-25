"use client";

import { Header } from "@/components/layout/Header";
import { MerchantWalletSetupPanel } from "@/components/merchant/MerchantWalletSetupPanel";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

export default function MerchantWalletSetupPage() {
  const { isMerchant } = useMerchantExperience();

  if (!isMerchant) {
    return (
      <div>
        <Header title="Wallet setup" />
        <p className="p-6 text-sm text-muted">Wallet setup is for merchant accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Wallet setup" />
      <div className="mx-auto max-w-lg p-6">
        <MerchantWalletSetupPanel />
      </div>
    </div>
  );
}
