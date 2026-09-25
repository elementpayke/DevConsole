"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MerchantPrivyShell } from "@/components/merchant/MerchantPrivyShell";
import { MerchantWalletSetupPanel } from "@/components/merchant/MerchantWalletSetupPanel";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

export default function MerchantAccountSetupPage() {
  const router = useRouter();
  const { isHydrated } = useAuth();
  const { isMerchant } = useMerchantExperience();

  useEffect(() => {
    if (isHydrated && !isMerchant) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isMerchant, router]);

  if (!isHydrated || !isMerchant) {
    return null;
  }

  return (
    <>
      <Header title="Account setup" />
      <MerchantPrivyShell>
        <div className="mx-auto max-w-lg p-6">
          <MerchantWalletSetupPanel />
        </div>
      </MerchantPrivyShell>
    </>
  );
}
