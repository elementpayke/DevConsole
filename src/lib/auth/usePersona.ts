"use client";

import { useEffect, useState } from "react";

export type Persona = "merchant" | "developer";

const STORAGE_KEY = "ep-persona";

function readStoredPersona(): Persona | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "merchant" || v === "developer" ? v : null;
}

/**
 * Which dashboard home to show a fresh account — "What do you want to do
 * first?" from signup. Client-only preference (no backend field for this),
 * so a visitor on a second device just gets asked again once.
 */
export function usePersona() {
  const [persona, setPersonaState] = useState<Persona | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setPersonaState(readStoredPersona());
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function setPersona(value: Persona) {
    window.localStorage.setItem(STORAGE_KEY, value);
    setPersonaState(value);
  }

  return { persona, setPersona, loaded };
}
