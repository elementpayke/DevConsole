"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace("/dashboard");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || isAuthenticated) return null;
  return <LandingPage />;
}
