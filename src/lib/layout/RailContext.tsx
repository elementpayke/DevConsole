"use client";

import { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "ep-rail-open";

function readInitialRailOpen(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "false";
}

type RailContextValue = {
  /** Desktop: rail expanded (labels visible) vs collapsed (icons only). */
  railOpen: boolean;
  toggleRail: () => void;
  /** Mobile: off-canvas drawer open. */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const RailContext = createContext<RailContextValue | null>(null);

export function RailProvider({ children }: { children: React.ReactNode }) {
  const [railOpen, setRailOpen] = useState(readInitialRailOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <RailContext.Provider value={{ railOpen, toggleRail, mobileOpen, openMobile, closeMobile }}>
      {children}
    </RailContext.Provider>
  );
}

export function useRail() {
  const ctx = useContext(RailContext);
  if (!ctx) throw new Error("useRail must be used within a RailProvider");
  return ctx;
}
