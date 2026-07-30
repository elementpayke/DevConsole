"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="10.5" width="16" height="10" rx="2" />
      <path strokeLinecap="round" d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Log in</h1>
      <p className="mb-7 text-[13.5px] text-muted">
        Welcome back. Access your developer console and payout operations.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Work email</div>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint">
              <MailIcon />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full box-border rounded-lg border border-line-strong py-2.5 pr-3.5 pl-10 font-sans text-[13.5px]"
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2.5">
            <span className="text-[12.5px] font-bold whitespace-nowrap">Password</span>
            <Link
              href="/forgot-password"
              className="text-[12.5px] font-semibold whitespace-nowrap text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 z-10 text-faint">
              <LockIcon />
            </span>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[12.5px] font-medium text-muted select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line-strong accent-primary"
          />
          Remember me
        </label>

        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full py-3.5 text-[14.5px]">
          {loading ? "Logging in…" : "Log in →"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[12px] font-medium text-faint">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <p className="text-center text-[13px] text-muted">
        No account yet?{" "}
        <Link href="/register" className="font-bold text-primary hover:text-primary-hover">
          Create one
        </Link>
      </p>
    </div>
  );
}
