"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ConsolePrivyAuthSync } from "@/components/merchant/ConsolePrivyAuthSync";

const BASE_CHAIN = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
};

function getPrivyAppId(): string | null {
  const id = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  return id || null;
}

export function MerchantPrivyShell({ children }: { children: ReactNode }) {
  const appId = getPrivyAppId();
  if (!appId) {
    return (
      <div className="p-6 text-sm text-muted">
        Wallet setup is unavailable (`NEXT_PUBLIC_PRIVY_APP_ID` is not configured).
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: [],
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
        },
        defaultChain: BASE_CHAIN,
        supportedChains: [BASE_CHAIN],
        appearance: {
          theme: "light",
          accentColor: "#0514eb",
        },
      }}
    >
      <ConsolePrivyAuthSync />
      {children}
    </PrivyProvider>
  );
}
