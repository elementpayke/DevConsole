"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth();
  const { isMerchant, partnerCustomerId } = useMerchantExperience();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !isMerchant) return;
    if (!partnerCustomerId && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isReady, isMerchant, partnerCustomerId, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
