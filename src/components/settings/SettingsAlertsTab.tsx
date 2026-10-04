"use client";

import { useState } from "react";

const DEFAULT_ALERTS = [
  { id: "failed", label: "Payment failed", note: "A customer's payment couldn't go through." },
  { id: "settled", label: "Payout settled", note: "Money has landed in your payout destination." },
  { id: "webhook", label: "Webhook failing", note: "Your endpoint hasn't acknowledged in a while." },
  { id: "kyb", label: "Verification updates", note: "Changes to your business verification status." },
];

export function SettingsAlertsTab() {
  const [email, setEmail] = useState("");
  const [slack, setSlack] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ failed: true, settled: true, webhook: true, kyb: true });

  return (
    <div className="flex max-w-[620px] flex-col gap-4">
      <div
        className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Preview only — destinations and switches are not saved and do not configure operational alerts.
      </div>
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
        Planned channels for when money stops moving.
      </p>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Alert email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ops@yourbusiness.com" style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Slack webhook
          <input value={slack} onChange={(e) => setSlack(e.target.value)} placeholder="https://hooks.slack.com/…" style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono)" }} />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        {DEFAULT_ALERTS.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl p-3.5" style={{ border: "1px solid var(--line)" }}>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13px] font-bold">{a.label}</span>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{a.note}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-label={`${a.label}: ${enabled[a.id] ? "on" : "off"} (preview)`}
              aria-checked={enabled[a.id]}
              onClick={() => setEnabled((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
              className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
              style={{ background: enabled[a.id] ? "var(--indigo)" : "var(--border-strong)" }}
            >
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: enabled[a.id] ? 18 : 2 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  width: "100%",
  boxSizing: "border-box",
};
