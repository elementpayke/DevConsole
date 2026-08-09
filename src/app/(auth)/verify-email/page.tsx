"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

const CODE_LENGTH = 6;

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

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = (params.get("email") ?? "").trim();
  const fromUnverifiedLogin = params.get("reason") === "unverified";

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function updateDigits(next: string[]) {
    setDigits(next);
  }

  function handleChange(idx: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[idx] = "";
      updateDigits(next);
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, CODE_LENGTH - idx).split("");
      const next = [...digits];
      chars.forEach((ch, i) => {
        next[idx + i] = ch;
      });
      updateDigits(next);
      inputRefs.current[Math.min(idx + chars.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    const next = [...digits];
    next[idx] = cleaned;
    updateDigits(next);
    if (idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      e.preventDefault();
      const next = [...digits];
      next[idx - 1] = "";
      updateDigits(next);
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    updateDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || code.length !== CODE_LENGTH) return;
    setError(null);
    setResendMessage(null);
    setLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setError(null);
    setResendMessage(null);
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setResendMessage("A new code has been sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <div>
        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Verify your email</h1>
        <p className="mb-7 text-[13.5px] text-muted">
          No email address was provided. Create an account first, then enter the code we send you.
        </p>
        <Link href="/register">
          <Button className="w-full py-3.5 text-[14.5px]">Go to create account</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <BackToLogin />
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Verify your email</h1>
      <p className="mb-5 text-[13.5px] text-muted">
        We sent a 6-digit code to <strong className="text-ink">{email}</strong>. Enter it below to
        activate your account.
      </p>
      {fromUnverifiedLogin && (
        <p className="mb-5 rounded-lg border border-primary/15 bg-primary-tint px-3.5 py-3 text-[12.5px] font-medium text-primary">
          Verify your email to continue — then you can log in.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-2.5 text-[12.5px] font-bold">Verification code</div>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                maxLength={idx === 0 ? CODE_LENGTH : 1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${idx + 1} of ${CODE_LENGTH}`}
                className="box-border h-12 w-11 rounded-lg border border-line-strong bg-white text-center font-sans text-lg font-bold tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-12"
              />
            ))}
          </div>
        </div>
        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}
        {resendMessage && (
          <p className="rounded-lg border border-[oklch(0.75_0.08_145)] bg-[oklch(0.97_0.03_145)] px-3.5 py-2.5 text-[12.5px] font-medium text-[oklch(0.42_0.1_145)]">
            {resendMessage}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading || code.length !== CODE_LENGTH}
          className="mt-2 w-full py-3.5 text-[14.5px]"
        >
          {loading ? "Verifying…" : "Verify email"}
        </Button>
        <p className="text-center text-[13px] font-medium text-ink">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-bold text-primary hover:text-primary-hover disabled:opacity-60"
          >
            {resending ? "Resending…" : "Resend"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Verify your email</h1>
          <p className="text-[13.5px] text-muted">Loading…</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
