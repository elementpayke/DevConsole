"use client";

import { Header } from "@/components/layout/Header";
import { MerchantPrivyShell } from "@/components/merchant/MerchantPrivyShell";
import { MerchantWalletSetupPanel } from "@/components/merchant/MerchantWalletSetupPanel";
import { useAuth } from "@/lib/auth/AuthContext";

/** Payout wallet linking — available to developers and merchants (capability, not role). */
export default function MerchantAccountSetupPage() {
  const { isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <Header title="Account setup" />
      <MerchantPrivyShell>
        <div className="mx-auto max-w-lg p-5 md:p-7">
          <MerchantWalletSetupPanel />
        </div>
      </MerchantPrivyShell>
    </>
  );
}
