import Image from "next/image";
import Link from "next/link";
import { EnvBadge } from "@/components/layout/EnvBadge";

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinejoin="round" d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

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
          <EnvBadge />
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
  );
}
