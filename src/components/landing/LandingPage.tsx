"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useColorMode } from "@/lib/theme/ThemeContext";

type Audience = "traders" | "freelancers" | "sellers" | "platforms" | "finance";

const AUDIENCES: Record<Audience, { label: string; title: string; sub: string }> = {
  traders: {
    label: "Traders",
    title: "Hold dollars. Pay suppliers anywhere.",
    sub: "Keep USDC for imports and shillings for home, in one place.",
  },
  freelancers: {
    label: "Freelancers",
    title: "Get paid in dollars, spend in shillings.",
    sub: "One link for clients abroad, instant payout at home.",
  },
  sellers: {
    label: "Online sellers",
    title: "One link. They pay the way they already do.",
    sub: "M-Pesa, card or USDC — checkout that matches your customer.",
  },
  platforms: {
    label: "Platforms",
    title: "Payouts and collections at scale.",
    sub: "Run your marketplace's money movement on one API.",
  },
  finance: {
    label: "Finance teams",
    title: "Reconcile once, not five times.",
    sub: "Every rail, every currency, one settlement ledger.",
  },
};

const CURRENCIES = [
  { code: "KE", label: "Kenya" },
  { code: "TZ", label: "Tanzania" },
  { code: "UG", label: "Uganda" },
  { code: "RW", label: "Rwanda" },
  { code: "GH", label: "Ghana" },
];

function FlagDot({ code }: { code: string }) {
  return (
    <span
      className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
      style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
    >
      {code[0]}
    </span>
  );
}

export function LandingPage() {
  const [audience, setAudience] = useState<Audience>("traders");
  const { mode, toggleMode } = useColorMode();
  const copy = AUDIENCES[audience];

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }} className="min-h-dvh">
      <header className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-6 py-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <Image src="/elementpay-logo.png" alt="ElementPay" width={24} height={24} className="rounded-[var(--radius-md)]" />
          <span className="font-heading text-[15px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>ElementPay</span>
          <span className="rounded-[var(--radius-md)] bg-primary-tint px-1.5 py-0.5 text-[11px] font-bold text-primary">
            Merchant
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
          <a href="https://docs.elementpay.net" target="_blank" rel="noopener" className="text-[13px] font-semibold no-underline" style={{ color: "var(--muted)" }}>
            Docs
          </a>
          <button
            type="button"
            onClick={toggleMode}
            className="text-[13px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            {mode === "light" ? "Dark mode" : "Light mode"}
          </button>
          <Link href="/login" className="text-[13px] font-semibold no-underline" style={{ color: "var(--ink)" }}>
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2.5 text-[13px] font-bold no-underline"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {(Object.keys(AUDIENCES) as Audience[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
                style={{
                  background: audience === key ? "var(--indigo)" : "var(--panel)",
                  color: audience === key ? "var(--on-indigo)" : "var(--muted)",
                  border: audience === key ? "none" : "1px solid var(--border)",
                }}
              >
                {AUDIENCES[key].label}
              </button>
            ))}
          </div>

          <h1 className="m-0 text-[40px] leading-[1.08] font-extrabold tracking-tight sm:text-[52px]">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-[46ch] text-[16px]" style={{ color: "var(--muted)" }}>
            {copy.sub}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="rounded-lg px-6 py-3.5 text-[14.5px] font-bold no-underline"
              style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-6 py-3.5 text-[14.5px] font-bold no-underline"
              style={{ border: "1px solid var(--border-strong)", color: "var(--ink)" }}
            >
              Log in
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <span className="text-[12px] font-semibold" style={{ color: "var(--faint)" }}>Supported currencies</span>
            {CURRENCIES.map((c) => (
              <span
                key={c.code}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                <FlagDot code={c.code} />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <span
            className="absolute -top-5 right-6 z-10 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={{ background: "var(--ok-bg)", color: "var(--ok-text)" }}
          >
            ✓ Supplier paid
          </span>
          <div
            className="overflow-hidden rounded-2xl p-5"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <div className="mb-4 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
              <span className="ml-2 text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
                For {AUDIENCES[audience].label}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-4" style={{ background: "var(--surface)" }}>
                <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>KES Wallet</div>
                <div className="mono mt-1 text-[24px] font-bold">184,200</div>
                <div className="text-[12px] font-semibold" style={{ color: "var(--ok-text)" }}>+12,500 today</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--surface)" }}>
                <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>USDC · Base</div>
                <div className="mono mt-1 text-[24px] font-bold">1,426.40</div>
                <div className="text-[12px]" style={{ color: "var(--muted)" }}>Ready to pay out</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--surface)" }}>
                <div className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>Recent movements</div>
                <div className="mt-2 flex items-center justify-between text-[13px] font-semibold">
                  <span>Top up · M-Pesa</span>
                  <span className="mono" style={{ color: "var(--ok-text)" }}>+5,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto mt-6 flex max-w-[1240px] flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-7 sm:px-10"
        style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
      >
        <span className="text-[17px] font-bold">Try it with test money first.</span>
        <Link
          href="/register"
          className="rounded-lg px-5 py-2.5 text-[13.5px] font-bold no-underline"
          style={{ background: "var(--on-indigo)", color: "var(--indigo)" }}
        >
          Get started
        </Link>
      </section>

      <footer className="mx-auto max-w-[1240px] px-6 py-10 text-center text-[12px]" style={{ color: "var(--faint)" }}>
        © {new Date().getFullYear()} ElementPay. Built on Base, Stellar and the rails your customers already use.
      </footer>
    </div>
  );
}
