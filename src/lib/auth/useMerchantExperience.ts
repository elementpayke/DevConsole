"use client";

import { useAuth } from "@/lib/auth/AuthContext";

/** Merchant portal chrome — fiat-first, Off-ramp, no Reference/API keys. */
export function useMerchantExperience() {
  const { user } = useAuth();
  const isMerchant = user?.role === "merchant";
  return {
    isMerchant,
    partnerCustomerId: user?.partner_customer_id ?? null,
  };
}
