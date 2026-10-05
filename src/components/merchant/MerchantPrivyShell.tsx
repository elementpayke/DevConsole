"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ConsolePrivyAuthSync } from "@/components/merchant/ConsolePrivyAuthSync";
import { TREASURY_CHAIN_OPTIONS } from "@/lib/merchantWallet";

const PRIVY_CHAINS = TREASURY_CHAIN_OPTIONS.map((c) => ({
  id: c.chainId,
  name: c.label,
  network: c.id,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [c.rpcUrl] } },
}));

function getPrivyAppId(): string | null {
  const id = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  return id || null;
}

export function MerchantPrivyShell({ children }: { children: ReactNode }) {
  const appId = getPrivyAppId();
  if (!appId) {
    return (
      <div className="mx-auto max-w-lg p-5 md:p-7">
        <div
          className="rounded-xl p-5 text-[13px] leading-relaxed"
          style={{ background: "var(--panel)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <p className="m-0 font-bold" style={{ color: "var(--ink)" }}>
            Wallet setup needs Privy
          </p>
          <p className="mt-2 mb-0">
            Set <span className="mono text-[12px]">NEXT_PUBLIC_PRIVY_APP_ID</span> in{" "}
            <span className="mono text-[12px]">.env.local</span> (same app as the ElementPay
            dapp), then restart <span className="mono text-[12px]">npm run dev</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // JWT via ConsolePrivyAuthSync (same pattern as dapp). Privy requires ≥1 login
        // method in config; merchants never open the wallet login modal on this route.
        loginMethods: ["wallet"],
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
        },
        defaultChain: PRIVY_CHAINS[0],
        supportedChains: PRIVY_CHAINS,
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
