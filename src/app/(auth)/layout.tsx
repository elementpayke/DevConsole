import Image from "next/image";
import Link from "next/link";
import { EnvBadge } from "@/components/layout/EnvBadge";

function InvoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinejoin="round" d="M6 3h9l3 3v15H6V3z" />
      <path strokeLinecap="round" d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h13l-3-3M20 17H7l3 3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6L2 12l6 6M16 6l6 6-6 6" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinejoin="round" d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: InvoiceIcon,
    title: "Stablecoin invoicing",
    description: "Invoice in USDC and reconcile faster than traditional FX.",
  },
  {
    icon: ExchangeIcon,
    title: "Off-ramp to mobile money",
    description: "Cash out to M-Pesa and local rails for payouts and payroll.",
  },
  {
    icon: CodeIcon,
    title: "Developer APIs & webhooks",
    description: "Ship production integrations with idempotency built in.",
  },
];

const MARKETS = ["Kenya", "Nigeria", "Ghana", "South Africa", "Uganda", "Egypt"];

function NavLink({ children }: { children: React.ReactNode }) {
  return <span className="text-[13.5px] font-semibold text-muted cursor-default">{children}</span>;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-8">
        <div className="flex items-center gap-9">
          <Link href="/login" className="flex shrink-0 items-center gap-2.5">
            <Image src="/elementpay-logo.png" alt="ElementPay" width={26} height={26} />
            <span className="text-base font-extrabold tracking-tight text-ink">ElementPay</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink>Services</NavLink>
            <NavLink>Blog</NavLink>
            <NavLink>Documentation</NavLink>
            <NavLink>API Console</NavLink>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="hidden text-[13.5px] font-semibold whitespace-nowrap text-ink hover:text-primary sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-[12.5px] font-bold whitespace-nowrap text-white hover:bg-primary-hover sm:px-4 sm:text-[13px]"
          >
            Start in Sandbox
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        <div
          className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16"
          style={{ background: "oklch(0.16 0.008 264)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 15% 15%, oklch(0.32 0.09 276 / 0.5) 0%, transparent 45%), radial-gradient(circle at 90% 85%, oklch(0.28 0.07 300 / 0.35) 0%, transparent 50%)",
            }}
          />

          <div className="absolute top-8 right-10 z-10">
            <EnvBadge dark />
          </div>

          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-[12.5px] font-bold tracking-wide text-primary uppercase" style={{ color: "oklch(0.72 0.13 276)" }}>
              Developer Console
            </p>
            <h1 className="text-[40px] leading-[1.12] font-extrabold tracking-tight text-white">
              Payment rails that work, for anyone.
            </h1>
            <p className="mt-5 text-[14.5px] leading-relaxed" style={{ color: "oklch(0.72 0.015 264)" }}>
              Seamless stablecoin payment infrastructure across Africa — invoice in USDC, collect
              payments, and settle to mobile money at scale.
            </p>

            <div className="mt-10 flex flex-col">
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`flex items-start gap-4 py-4 ${i > 0 ? "border-t" : ""}`}
                  style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "oklch(1 0 0 / 0.06)", color: "oklch(0.85 0.03 264)" }}
                  >
                    <feature.icon />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white">{feature.title}</div>
                    <div className="mt-0.5 text-[13px]" style={{ color: "oklch(0.65 0.015 264)" }}>
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <blockquote
              className="mt-9 rounded-xl border-l-2 py-1 pl-4 text-[13.5px] leading-relaxed italic"
              style={{ borderColor: "oklch(0.6 0.13 276)", color: "oklch(0.78 0.015 264)" }}
            >
              &ldquo;ElementPay lets us collect in stablecoins, while customers pay in USSD. It
              bridges the gap between what our investors need and what locals can use.&rdquo;
              <footer className="mt-2 text-[12.5px] font-semibold not-italic" style={{ color: "oklch(0.6 0.012 264)" }}>
                Leo Lin, Co-founder, Arkreen
              </footer>
            </blockquote>
          </div>

          <div
            className="relative z-10 mt-10 text-[12px] font-medium tracking-wide uppercase"
            style={{ color: "oklch(0.55 0.012 264)" }}
          >
            Live in {MARKETS.join(" · ")}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 animate-fade-in">
          <div className="w-[420px] max-w-full rounded-[20px] border border-line bg-white px-9 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
            {children}
          </div>
          <p className="mt-6 flex max-w-[420px] items-center justify-center gap-1.5 text-center text-xs text-faint">
            <ShieldCheckIcon />
            By continuing you agree to ElementPay&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
