"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { RailProvider } from "@/lib/layout/RailContext";

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
    <RailProvider>
      <div className="flex min-h-screen animate-fade-in">
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <div className="min-w-0 flex-1" style={{ background: "transparent" }}>
          <div className="h-1" style={{ background: "var(--env-band)" }} />
          {children}
        </div>
      </div>
    </RailProvider>
  );
}
