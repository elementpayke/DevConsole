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
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean,
    turnstileToken?: string | null,
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    turnstileToken?: string | null,
    role?: "developer" | "merchant" | "user",
  ) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LEGACY_STORAGE_KEY = "elementpay-devconsole:auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Clear legacy localStorage JWTs from pre-BFF builds (tokens must not live in JS).
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    let cancelled = false;
    authApi
      .getSession()
      .then((session) => {
        if (!cancelled) setUser(session.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember = true,
      turnstileToken?: string | null,
    ) => {
      const { user: nextUser } = await authApi.login(
        email,
        password,
        remember,
        turnstileToken,
      );
      setUser(nextUser);
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      turnstileToken?: string | null,
      role?: "developer" | "merchant" | "user",
    ) => {
      return authApi.register(email, password, turnstileToken, role);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isHydrated,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isHydrated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
