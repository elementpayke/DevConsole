"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
