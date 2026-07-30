"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-subtle"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back to log in
    </Link>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setResending(true);
    try {
      await authApi.requestPasswordReset(email);
      setResendMessage("A new code has been sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordReset(email, code, newPassword);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div>
        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Password reset</h1>
        <p className="mb-7 text-[13.5px] text-muted">
          Your password has been updated. You can now log in with your new password.
        </p>
        <Link href="/login">
          <Button className="w-full py-3.5 text-[14.5px]">Back to log in</Button>
        </Link>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div>
        <BackToLogin />
        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Enter reset code</h1>
        <p className="mb-7 text-[13.5px] text-muted">
          Check <strong className="text-ink">{email}</strong> for the code we just sent, then set a
          new password.
        </p>
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[12.5px] font-bold">Reset code</div>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[12.5px] font-bold">New password</div>
            <PasswordInput
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[12.5px] font-bold">Confirm new password</div>
            <PasswordInput
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
            />
          </div>
          {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}
          {resendMessage && <p className="text-[12.5px] font-medium text-subtle">{resendMessage}</p>}
          <Button type="submit" disabled={loading} className="mt-2 w-full py-3.5 text-[14.5px]">
            {loading ? "Resetting…" : "Reset password"}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-[12.5px] font-semibold text-subtle disabled:opacity-60"
          >
            {resending ? "Resending…" : "Didn't get a code? Resend"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <BackToLogin />
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Reset your password</h1>
      <p className="mb-7 text-[13.5px] text-muted">
        We&apos;ll email a reset code to your registered address.
      </p>
      <form onSubmit={handleRequest} className="flex flex-col gap-5">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Email</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full py-3.5 text-[14.5px]">
          {loading ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    </div>
  );
}
