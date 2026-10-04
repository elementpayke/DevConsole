"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRail } from "@/lib/layout/RailContext";

function NavIcon({ d }: { d: React.ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      {d}
    </svg>
  );
}

const ICONS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  transactions: (
    <>
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </>
  ),
  wallets: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  checkout: (
    <>
      <path d="M12 3v9" />
      <path d="m8 9 4 4 4-4" />
      <path d="M3 15v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    </>
  ),
  keys: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.7 12.3 8.3-8.3" />
      <path d="m16 5 3 3" />
      <path d="m19 8 2-2-3-3-2 2" />
    </>
  ),
  reference: (
    <>
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22z" />
      <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5a2.5 2.5 0 0 1 2.5 2z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.63.67 1.1 1.31 1.1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
};

function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
      <path strokeLinecap="round" d="M21 12H9" />
    </svg>
  );
}

const CHECKOUT_SUBLINKS = [
  { tab: "links", label: "Payment links" },
  { tab: "invoices", label: "Invoices" },
  { tab: "embed", label: "Embed on site" },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { railOpen, toggleRail, mobileOpen, closeMobile } = useRail();
  const [checkoutOpen, setCheckoutOpen] = useState(true);

  const initial = (user?.email?.[0] ?? "?").toUpperCase();
  const onCheckout = pathname.startsWith("/checkout");
  const activeCheckoutTab = searchParams.get("tab") ?? "links";

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  function navLinkClass(active: boolean) {
    return `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] ${
      active ? "font-bold" : "font-semibold"
    }`;
  }

  function navLinkStyle(active: boolean): React.CSSProperties {
    return {
      background: active ? "var(--indigo)" : "transparent",
      color: active ? "var(--on-indigo)" : "var(--rail-muted)",
    };
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: ICONS.overview },
    { href: "/transactions", label: "Transactions", icon: ICONS.transactions },
    { href: "/wallets", label: "Wallets", icon: ICONS.wallets },
  ];

  const content = (
    <>
      <div className="flex items-center gap-2 px-3 py-[13px]">
        <Image src="/elementpay-logo.png" alt="ElementPay" width={24} height={24} className="flex-shrink-0 rounded-[6px]" />
        {railOpen && (
          <>
            <span className="min-w-0 truncate text-[16px] font-bold tracking-tight" style={{ color: "var(--rail-text)" }}>
              ElementPay
            </span>
            <span
              className="flex-shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
            >
              Console
            </span>
          </>
        )}
        <button
          type="button"
          onClick={toggleRail}
          aria-label={railOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="ml-auto hidden h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg text-[12px] md:flex"
          style={{ border: "1px solid var(--rail-line)", color: "var(--rail-dim)" }}
        >
          {railOpen ? "⟨" : "⟩"}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={navLinkClass(active)}
              style={navLinkStyle(active)}
              title={railOpen ? undefined : item.label}
            >
              <NavIcon d={item.icon} />
              {railOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        <div className="flex items-center rounded-lg" style={navLinkStyle(onCheckout)}>
          <Link
            href="/checkout"
            onClick={closeMobile}
            className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-[13.5px] ${
              onCheckout ? "font-bold" : "font-semibold"
            }`}
            style={{ color: "inherit" }}
            title={railOpen ? undefined : "Checkout"}
          >
            <NavIcon d={ICONS.checkout} />
            {railOpen && <span className="truncate">Checkout</span>}
          </Link>
          {railOpen && (
            <button
              type="button"
              aria-label="Show or hide checkout pages"
              aria-expanded={checkoutOpen}
              onClick={() => setCheckoutOpen((v) => !v)}
              className="mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
              style={{ color: "inherit" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: checkoutOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
        {railOpen && checkoutOpen && (
          <div className="flex flex-col gap-0.5 pl-[13px]">
            {CHECKOUT_SUBLINKS.map((sub) => {
              const active = onCheckout && activeCheckoutTab === sub.tab;
              return (
                <Link
                  key={sub.tab}
                  href={`/checkout?tab=${sub.tab}`}
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
                  style={navLinkStyle(active)}
                >
                  <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ background: "currentColor", opacity: 0.55 }} />
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}

        <Link
          href="/api-keys"
          onClick={closeMobile}
          className={navLinkClass(pathname.startsWith("/api-keys"))}
          style={navLinkStyle(pathname.startsWith("/api-keys"))}
          title={railOpen ? undefined : "API Keys"}
        >
          <NavIcon d={ICONS.keys} />
          {railOpen && <span className="truncate">API Keys</span>}
        </Link>
        <Link
          href="/reference"
          onClick={closeMobile}
          className={navLinkClass(pathname.startsWith("/reference"))}
          style={navLinkStyle(pathname.startsWith("/reference"))}
          title={railOpen ? undefined : "Reference"}
        >
          <NavIcon d={ICONS.reference} />
          {railOpen && <span className="truncate">Reference</span>}
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 px-2 pb-2.5 pt-2" style={{ borderTop: "1px solid var(--rail-line)" }}>
        <Link
          href="/profile"
          onClick={closeMobile}
          className={navLinkClass(pathname.startsWith("/profile"))}
          style={navLinkStyle(pathname.startsWith("/profile"))}
          title={railOpen ? undefined : "Settings"}
        >
          <NavIcon d={ICONS.settings} />
          {railOpen && <span className="truncate">Settings</span>}
        </Link>

        <div className="mt-1.5 flex items-center gap-2 rounded-lg px-2 py-2" style={{ background: "var(--surface)" }}>
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
            style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
          >
            {initial}
          </div>
          {railOpen && (
            <>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-bold" style={{ color: "var(--rail-text)" }}>
                  {user?.email ?? "Account"}
                </div>
                <div className="truncate text-[11px]" style={{ color: "var(--rail-dim)" }}>
                  {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="ml-auto flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg"
                style={{ color: "var(--rail-dim)" }}
              >
                <SignOutIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-[55] bg-black/40 md:hidden"
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex h-screen w-[260px] flex-shrink-0 flex-col transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 md:visible md:pointer-events-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full max-md:invisible max-md:pointer-events-none"
        } ${railOpen ? "md:w-[260px]" : "md:w-[76px]"}`}
        style={{
          background: "var(--rail)",
          borderRight: "1px solid var(--rail-line)",
          boxShadow: "1px 0 24px oklch(0.2 0.02 264 / 0.06)",
        }}
      >
        {content}
      </aside>
    </>
  );
}
