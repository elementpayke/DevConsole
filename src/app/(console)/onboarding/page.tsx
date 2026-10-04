"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { ApiError } from "@/lib/api/client";

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "11px 13px",
  fontSize: 13.5,
  width: "100%",
  boxSizing: "border-box",
};

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
        <div className="p-7 text-sm" style={{ color: "var(--muted)" }}>
          Onboarding is for merchant accounts.
        </div>
      </div>
    );
  }

  if (partnerCustomerId) {
    return (
      <div>
        <Header title="Onboarding" />
        <div className="mx-auto max-w-lg p-5 md:p-7">
          <section className="rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              Vault customer linked: <span className="mono text-xs">{partnerCustomerId}</span>
            </p>
            <p className="mt-3 text-[13px]" style={{ color: "var(--muted)" }}>
              Complete KYB documents and submit for ElementPay review. Off-ramp unlocks once approved.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
          </section>
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
      const json = (await res.json().catch(() => null)) as { message?: string } | null;
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
      <div className="mx-auto max-w-[560px] p-5 md:p-7">
        <div className="mb-5 flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--indigo-tint)" }}>
          <span
            className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            i
          </span>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--indigo-text)" }}>
            Create your business vault profile under ElementPay. You can upload KYB documents next —
            admin reviews and approves before Off-ramp unlocks.
          </p>
        </div>

        <section className="rounded-xl p-[22px]" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Legal name
              <input required style={inputStyle} value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Country
              <select style={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)}>
                {["TZ", "KE", "UG", "NG", "GH", "ZA"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Registration number
              <input
                required
                style={{ ...inputStyle, fontFamily: "var(--font-ibm-plex-mono)" }}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Business email
              <input required type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Phone (optional)
              <input
                style={{ ...inputStyle, fontFamily: "var(--font-ibm-plex-mono)" }}
                placeholder="+255…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {error && <p className="text-[13px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              {busy ? "Creating…" : "Create business profile"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
