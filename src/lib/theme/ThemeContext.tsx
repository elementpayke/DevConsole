"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "ep-color-mode";

type ThemeContextValue = {
  mode: ColorMode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyMode(mode: ColorMode) {
  document.documentElement.dataset.theme = mode;
}

function readInitialMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(readInitialMode);

  useEffect(() => {
    applyMode(mode);
    // Only syncing the DOM attribute to the mode set elsewhere (toggleMode) — not a setState loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleMode() {
    setMode((prev) => {
      const next: ColorMode = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyMode(next);
      return next;
    });
  }

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
}

export function useColorMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useColorMode must be used within a ThemeProvider");
  return ctx;
}
