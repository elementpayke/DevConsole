"use client";

import { useEffect, useState } from "react";
import { getPartnerCustomer } from "@/lib/api/partnerCustomer";
import type { PartnerCustomer } from "@/lib/types";

/** The merchant's own KYB vault case — null if onboarding hasn't started one yet. */
export function usePartnerCustomer() {
  const [partnerCustomer, setPartnerCustomer] = useState<PartnerCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return undefined;
        setLoading(true);
        setError(null);
        return getPartnerCustomer();
      })
      .then((data) => {
        if (!cancelled && data !== undefined) setPartnerCustomer(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load verification status.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return {
    partnerCustomer,
    loading,
    error,
    refresh: () => setNonce((n) => n + 1),
  };
}
