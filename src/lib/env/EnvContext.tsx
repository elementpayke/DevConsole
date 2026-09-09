"use client";

import { createContext, useContext } from "react";

export type Environment = "sandbox" | "live";

/** Deployed environment from NEXT_PUBLIC_ENVIRONMENT (build-time). No client toggle. */
export const DEPLOYED_ENVIRONMENT: Environment =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "live" ? "live" : "sandbox";

type EnvContextValue = {
  environment: Environment;
};

const EnvContext = createContext<EnvContextValue | null>(null);

export function EnvProvider({ children }: { children: React.ReactNode }) {
  return (
    <EnvContext.Provider value={{ environment: DEPLOYED_ENVIRONMENT }}>
      {children}
    </EnvContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvContext);
  if (!ctx) throw new Error("useEnvironment must be used within an EnvProvider");
  return ctx;
}
