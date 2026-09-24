"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { ApiError } from "@/lib/api/client";

export default function MerchantOnboardingPage() {
  const { user } = useAuth();
  const { isMerchant, partnerCustomerId } = useMerchantExperience();
  const router = useRouter();
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("TZ");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isMerchant) {
    return (
      <div>
        <Header title="Onboarding" />
        <div className="p-6 text-sm text-muted">
          Onboarding is for merchant accounts.
        </div>
      </div>
    );
  }

  if (partnerCustomerId) {
    return (
      <div>
        <Header title="Onboarding" />
        <div className="mx-auto max-w-lg p-6">
          <GlassCard className="p-5">
            <p className="text-sm text-muted">
              Vault customer linked:{" "}
              <span className="mono text-xs">{partnerCustomerId}</span>
            </p>
            <p className="mt-3 text-[13px] text-muted">
              Complete KYB documents and submit for ElementPay review (admin).
              After EP-only approve, Off-ramp unlocks.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/merchant/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          legal_name: legalName.trim(),
          country,
          registration_number: registrationNumber.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!res.ok) {
        throw new ApiError(json?.message || "Onboarding failed", res.status, json);
      }
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Header title="Business onboarding" />
      <div className="mx-auto max-w-lg p-6">
        <p className="mb-4 text-sm text-muted">
          Create your business vault profile under ElementPay. You can upload
          KYB documents next; admin approves for ElementPay (no Nuvion unless
          requested).
        </p>
        <GlassCard className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-[12px] font-semibold text-faint">
              Legal name
              <input
                required
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Country
              <select
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {["TZ", "KE", "UG", "NG", "GH", "ZA"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Registration number
              <input
                required
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Business email
              <input
                required
                type="email"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Phone (optional)
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                placeholder="+255…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {error && (
              <p className="text-[13px] text-[oklch(0.55_0.19_25)]">{error}</p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create business profile"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
