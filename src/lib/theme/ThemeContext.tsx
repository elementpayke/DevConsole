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

function readStoredMode(): ColorMode | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : null;
  } catch {
    // Storage can be unavailable (private browsing, denied permission, etc).
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always starts "light" so the first client render matches the server-rendered
  // markup (descendants read `mode` for visible text, e.g. the theme toggle label) —
  // the inline script in layout.tsx already paints <html data-theme> before paint,
  // this just syncs React state to the real preference right after hydration.
  const [mode, setMode] = useState<ColorMode>("light");

  useEffect(() => {
    const stored = readStoredMode();
    if (stored) {
      // Sync browser preference after hydration; SSR snapshot stays "light".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(stored);
      applyMode(stored);
    }
  }, []);

  function toggleMode() {
    setMode((prev) => {
      const next: ColorMode = prev === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Keep the toggle usable even if persistence fails.
      }
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
