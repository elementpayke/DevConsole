"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ep-rail-open";

function readStoredRailOpen(): boolean | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? null : stored !== "false";
  } catch {
    return null;
  }
}

function writeStoredRailOpen(open: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(open));
  } catch {
    // Collapse/expand still works for this session even if persistence fails.
  }
}

type RailContextValue = {
  railOpen: boolean;
  toggleRail: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const RailContext = createContext<RailContextValue | null>(null);

export function RailProvider({ children }: { children: React.ReactNode }) {
  // Starts expanded (matches SSR) and syncs the saved preference after mount,
  // rather than reading localStorage during the initial render, to avoid a
  // hydration mismatch against the server-rendered markup.
  const [railOpen, setRailOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredRailOpen();
    // Sync saved rail preference after hydration; SSR snapshot stays expanded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setRailOpen(stored);
  }, []);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => {
      const next = !prev;
      writeStoredRailOpen(next);
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
