import Image from "next/image";
import Link from "next/link";
import { EnvBadge } from "@/components/layout/EnvBadge";
import { EnvSwitchLink } from "@/components/layout/EnvSwitchLink";
import { CheckoutSimPanel } from "@/components/auth/CheckoutSimPanel";

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinejoin="round" d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background: "var(--indigo-tint)",
        backgroundImage: "radial-gradient(rgba(67,57,202,0.08) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 sm:px-8">
        <Link href="/login" className="flex shrink-0 items-center gap-2.5">
          <Image src="/elementpay-logo.png" alt="ElementPay" width={22} height={22} className="rounded-[5px]" />
          <span className="text-[15px] font-bold tracking-tight text-ink">ElementPay</span>
          <span className="rounded-md bg-primary-tint px-1.5 py-0.5 text-[11px] font-bold text-primary">
            Merchant
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <EnvBadge dark={false} />
          <EnvSwitchLink />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1240px] flex-1 items-stretch gap-7 px-6 py-8 animate-fade-in">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-[480px] max-w-full rounded-xl border border-line bg-white px-[22px] py-[22px] shadow-[0_8px_30px_rgba(20,24,28,0.08)]">
            {children}
          </div>
          <p className="mt-5 flex max-w-[480px] items-center justify-center gap-1.5 text-center text-xs text-faint">
            <ShieldCheckIcon />
            By continuing you agree to ElementPay&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
        <div className="hidden flex-1 lg:block">
          <CheckoutSimPanel />
        </div>
      </div>
    </div>
  );
}
