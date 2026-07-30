"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthTokens, User } from "@/lib/types";

const STORAGE_KEY = "elementpay-devconsole:auth";

type StoredSession = {
  tokens: AuthTokens;
  user: User | null;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Reads localStorage post-hydration, deliberately — doing this during
    // render would desync server/client output and trigger a hydration error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSession());
    setIsHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    let user: User | null = null;
    try {
      user = await authApi.getMe(tokens.access_token);
    } catch {
      user = null;
    }
    const next = { tokens, user };
    setSession(next);
    writeSession(next);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    return authApi.register(email, password);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    writeSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.tokens.access_token ?? null,
      isHydrated,
      isAuthenticated: Boolean(session?.tokens.access_token),
      login,
      register,
      logout,
    }),
    [session, isHydrated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
