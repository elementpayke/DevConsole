"use client";

import { useState } from "react";

const DEFAULT_METHODS = [
  { id: "mpesa", label: "M-Pesa", note: "Mobile money collections in Kenya." },
  { id: "cards", label: "Cards", note: "Visa and Mastercard via our processor." },
  { id: "stable", label: "USDC / USDT", note: "Direct stablecoin payments." },
];

export function SettingsMethodsTab() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ mpesa: true, cards: true, stable: true });

  return (
    <div className="flex max-w-[620px] flex-col gap-3">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>Off means hidden everywhere customers see checkout.</p>
      {DEFAULT_METHODS.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 rounded-xl p-3.5"
          style={{ border: "1px solid var(--line)" }}
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[13px] font-bold">{m.label}</span>
            <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{m.note}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled[m.id]}
            onClick={() => setEnabled((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
            className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors"
            style={{ background: enabled[m.id] ? "var(--indigo)" : "var(--border-strong)" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
              style={{ left: enabled[m.id] ? 18 : 2 }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
