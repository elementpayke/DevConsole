import Image from "next/image";
import { MatrixCanvas } from "@/components/auth/MatrixCanvas";
import { EnvBadge } from "@/components/layout/EnvBadge";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 animate-fade-in"
      style={{ background: "oklch(0.19 0.025 264)" }}
    >
      <MatrixCanvas />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, oklch(0.19 0.025 264) 78%)",
        }}
      />
      <div className="absolute top-10 left-12 z-10 flex items-center gap-3.5">
        <Image src="/elementpay-logo.png" alt="ElementPay" width={26} height={26} />
        <span className="text-base font-extrabold tracking-tight text-white">ElementPay</span>
      </div>
      <div className="absolute top-10 right-12 z-10">
        <EnvBadge dark />
      </div>

      <div
        className="solid-card relative z-10 w-[400px] max-w-full rounded-[20px] px-9 py-10"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
      >
        {children}
        <p className="mt-7 text-center text-xs" style={{ color: "oklch(0.6 0.012 264)" }}>
          By continuing you agree to ElementPay&apos;s Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
