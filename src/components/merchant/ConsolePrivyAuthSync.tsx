"use client";

import { useCallback } from "react";
import { useSubscribeToJwtAuthWithFlag } from "@privy-io/react-auth";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Bridges Console JWT session → Privy custom auth (same pattern as ElementPay dapp).
 */
export function ConsolePrivyAuthSync() {
  const { isAuthenticated, isHydrated } = useAuth();

  const getExternalJwt = useCallback(async (): Promise<string | undefined> => {
    const res = await fetch("/api/auth/privy-token", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { token?: string };
    return typeof json.token === "string" ? json.token : undefined;
  }, []);

  useSubscribeToJwtAuthWithFlag({
    isAuthenticated: isHydrated && isAuthenticated,
    isLoading: !isHydrated,
    getExternalJwt,
  });

  return null;
}
