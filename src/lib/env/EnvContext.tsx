"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Environment = "sandbox" | "live";

const STORAGE_KEY = "elementpay-devconsole:environment";

// Set per-deployment via NEXT_PUBLIC_ENVIRONMENT (baked in at build time) so the
// sandbox vs. live instances of this same codebase show the correct badge
// without any client-side toggle. Falls back to "sandbox" if unset.
const DEPLOYED_ENVIRONMENT: Environment =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "live" ? "live" : "sandbox";

type EnvContextValue = {
  environment: Environment;
  toggleEnvironment: () => void;
  setEnvironment: (env: Environment) => void;
};

const EnvContext = createContext<EnvContextValue | null>(null);

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const [environment, setEnvironment] = useState<Environment>(DEPLOYED_ENVIRONMENT);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Reads localStorage post-hydration, deliberately — see AuthContext for why.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "sandbox" || stored === "live") setEnvironment(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, environment);
  }, [environment]);

  return (
    <EnvContext.Provider
      value={{
        environment,
        setEnvironment,
        toggleEnvironment: () =>
          setEnvironment((e) => (e === "sandbox" ? "live" : "sandbox")),
      }}
    >
      {children}
    </EnvContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvContext);
  if (!ctx) throw new Error("useEnvironment must be used within an EnvProvider");
  return ctx;
}
