"use client";

import type { ReactNode } from "react";
import { MerchantPrivyShell } from "@/components/merchant/MerchantPrivyShell";

export default function MerchantWalletSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MerchantPrivyShell>{children}</MerchantPrivyShell>;
}
