"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import {
  canSubmitWithTurnstile,
  isTurnstileConfigured,
} from "@/lib/turnstile";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [businessEmail, setBusinessEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileRequired = isTurnstileConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!canSubmitWithTurnstile(turnstileRequired, turnstileToken)) {
      setError("Please complete the captcha check");
      return;
    }
    setLoading(true);
    try {
      const email = businessEmail.trim();
      await register(email, password, turnstileToken);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !loading && canSubmitWithTurnstile(turnstileRequired, turnstileToken);

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mb-7 text-[13.5px] text-muted">
        Create an account to manage API keys and transactions.
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
            autoComplete="email"
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
            autoComplete="new-password"
          />
          <p className="mt-1.5 text-[11px] text-faint">
            8+ characters, one uppercase, one lowercase, one number.
          </p>
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Confirm password</div>
          <PasswordInput
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </div>

        <TurnstileWidget
          key={turnstileKey}
          onToken={setTurnstileToken}
          className="w-full"
        />

        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}

        <Button type="submit" disabled={!canSubmit} className="mt-2 w-full py-3.5 text-[14.5px]">
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
