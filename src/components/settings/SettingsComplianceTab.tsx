import Link from "next/link";

export function SettingsComplianceTab({ kycVerified }: { kycVerified: boolean }) {
  const steps = [
    { label: "Account created", done: true },
    { label: "Business details", done: kycVerified },
    { label: "Document review", done: kycVerified },
    { label: "Live access", done: kycVerified },
  ];

  return (
    <div className="flex max-w-[620px] flex-col gap-4">
      <div
        className="flex flex-wrap items-center gap-3.5 rounded-xl p-4"
        style={{ border: "1px solid var(--indigo)", background: "var(--indigo-tint)" }}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--indigo-text)" }}>Verification</span>
          <span className="text-[16px] font-bold">{kycVerified ? "Verified" : "In progress"}</span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            {kycVerified ? "Your business can accept live payments." : "Finish verification to accept real money."}
          </span>
        </span>
        {!kycVerified && (
          <Link
            href="/account/setup"
            className="ml-auto rounded-lg px-4 py-2.5 text-[12.5px] font-bold no-underline"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            Continue verification
          </Link>
        )}
      </div>

      <div className="flex items-start gap-1.5 pt-1">
        {steps.map((s) => (
          <span key={s.label} className="flex flex-1 flex-col gap-1.5">
            <span
              className="h-1.5 rounded-full"
              style={{ background: s.done ? "var(--indigo)" : "var(--line)" }}
            />
            <span className="text-[11px] font-semibold" style={{ color: s.done ? "var(--indigo-text)" : "var(--faint)" }}>
              {s.label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex gap-5 pt-1">
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>Test-mode limit</span>
          <span className="mono text-[16px] font-medium">KES 0</span>
          <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>No cap — pretend money</span>
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>Live limit</span>
          <span className="mono text-[16px] font-medium">{kycVerified ? "Set by ElementPay" : "Locked"}</span>
          <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>
            {kycVerified ? "Your account limit is not shown here yet" : "Unlocks after verification"}
          </span>
        </span>
      </div>
    </div>
  );
}
