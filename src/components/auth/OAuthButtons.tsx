"use client";

import Image from "next/image";

const ERROR_COPY: Record<string, string> = {
  state_mismatch: "That sign-in link expired — please try again.",
  exchange_failed: "We couldn't confirm that with the provider — please try again.",
  aggregator_unreachable: "ElementPay is temporarily unreachable — please try again.",
  login_failed: "Sign-in failed — please try again or use email instead.",
};

export function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return ERROR_COPY[code] ?? "Sign-in failed — please try again.";
}

export function OAuthButtons({ role }: { role: "merchant" | "user" }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <a
        href={`/api/auth/oauth/github/start?role=${role}`}
        className="flex items-center justify-center gap-2 rounded-lg border border-line-strong px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
      >
        <Image src="/brand-github.svg" alt="" width={18} height={18} aria-hidden />
        Continue with GitHub
      </a>
      <a
        href={`/api/auth/oauth/google/start?role=${role}`}
        className="flex items-center justify-center gap-2 rounded-lg border border-line-strong px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
      >
        <Image src="/brand-google.svg" alt="" width={18} height={18} aria-hidden />
        Continue with Google
      </a>
    </div>
  );
}
