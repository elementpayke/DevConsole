"use client";

import { useState } from "react";
import type { Persona } from "@/lib/auth/usePersona";

const OPTIONS: Array<{
  persona: Persona;
  title: string;
  note: string;
  icon: string;
}> = [
  { persona: "merchant", title: "Get paid", note: "Payment links, WhatsApp and walk-in QR", icon: "↓" },
  { persona: "merchant", title: "Pay people", note: "Suppliers, staff and riders", icon: "↑" },
  { persona: "developer", title: "Build with the API", note: "For developers", icon: "{ }" },
];

export function PersonaPicker({
  firstName,
  onChoose,
}: {
  firstName: string;
  onChoose: (persona: Persona) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4">
      <div>
        <h1 className="m-0 text-[22px] font-extrabold">Welcome, {firstName}</h1>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
          What do you want to do first? You can change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.title}
            type="button"
            onClick={() => setSelected(i)}
            className="flex flex-col items-start gap-2 rounded-xl p-4 text-left"
            style={{
              border: `1px solid ${selected === i ? "var(--indigo)" : "var(--border)"}`,
              background: selected === i ? "var(--indigo-tint)" : "var(--panel)",
            }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold"
              style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
            >
              {opt.icon}
            </span>
            <span className="text-[13.5px] font-bold">{opt.title}</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{opt.note}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={selected === null}
        onClick={() => selected !== null && onChoose(OPTIONS[selected].persona)}
        className="self-start rounded-lg px-5 py-2.5 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
      >
        Open my dashboard
      </button>
    </div>
  );
}
