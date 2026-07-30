"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (active: boolean) => (
      <div className="grid h-3.5 w-3.5 grid-cols-2 gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1px]"
            style={{ background: active ? "#fff" : "oklch(0.55 0.012 264)" }}
          />
        ))}
      </div>
    ),
  },
  {
    href: "/api-keys",
    label: "API Keys",
    icon: (active: boolean) => (
      <div
        className="h-3.5 w-3.5 rounded-full border-2"
        style={{ borderColor: active ? "#fff" : "oklch(0.55 0.012 264)" }}
      />
    ),
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: (active: boolean) => (
      <div
        className="h-3 w-3 rotate-45"
        style={{ background: active ? "#fff" : "oklch(0.55 0.012 264)" }}
      />
    ),
  },
  {
    href: "/reference",
    label: "Reference",
    icon: (active: boolean) => (
      <div
        className="h-3.5 w-3.5 rounded-[3px] border-2"
        style={{ borderColor: active ? "#fff" : "oklch(0.55 0.012 264)" }}
      />
    ),
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const initial = (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <div
      className="glass-panel flex h-screen w-[248px] flex-shrink-0 flex-col sticky top-0"
      style={{
        borderRight: "1px solid oklch(1 0 0 / 0.4)",
        boxShadow: "1px 0 24px oklch(0.2 0.02 264 / 0.06)",
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-line px-[22px] py-5">
        <Image src="/elementpay-logo.png" alt="ElementPay" width={26} height={26} />
        <span className="text-base font-extrabold tracking-tight">ElementPay</span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold"
              style={{
                background: active ? "oklch(0.19 0.02 264)" : "transparent",
                color: active ? "#fff" : "oklch(0.42 0.015 264)",
                fontWeight: active ? 700 : 600,
              }}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}

        <div
          className="mt-0.5 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold opacity-50"
          style={{ color: "oklch(0.55 0.012 264)" }}
          title="Coming soon"
        >
          <div className="relative h-3.5 w-3.5 rounded-full border-2" style={{ borderColor: "oklch(0.55 0.012 264)" }}>
            <div
              className="absolute top-[2.5px] left-[2.5px] h-[5px] w-[5px] rounded-full"
              style={{ background: "oklch(0.55 0.012 264)" }}
            />
          </div>
          Off-ramp
        </div>
      </div>

      <Link
        href="/profile"
        className="flex items-center gap-2.5 border-t border-line px-[22px] py-3.5"
        style={{ background: pathname === "/profile" ? "oklch(0.97 0.004 264)" : "transparent" }}
      >
        <div
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: "#f0effc", color: "#352ab0" }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold">{user?.email ?? "Account"}</div>
          <div className="truncate text-[11.5px] text-faint">
            {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ""}
          </div>
        </div>
      </Link>
    </div>
  );
}
