"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const [businessEmail, setBusinessEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(businessEmail, password);
      setRegistered(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div>
        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Check your email</h1>
        <p className="mb-2 text-[13.5px] text-muted">
          We&apos;ve sent a verification link to <strong className="text-ink">{businessEmail}</strong>.
          Verify your account, then log in to reach your dashboard.
        </p>
        <Link href="/login">
          <Button className="mt-5 w-full py-3.5 text-[14.5px]">Back to log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mb-7 text-[13.5px] text-muted">
        Start in sandbox — no KYC required until you go live.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Work email</div>
          <input
            type="email"
            required
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Password</div>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <p className="mt-1.5 text-[11px] text-faint">
            8+ characters, one uppercase, one lowercase, one number.
          </p>
        </div>

        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full py-3.5 text-[14.5px]">
          {loading ? "Creating account…" : "Create account →"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </div>
  );
}
