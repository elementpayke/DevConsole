"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PosterModal } from "@/components/checkout/PosterModal";

type AccountRow = { acc: string; label: string; type: "Reusable" | "One-time"; collected: number };

function randomAccountNumber(taken: ReadonlySet<string>): string {
  let candidate: string;
  do {
    candidate = Math.floor(100000 + Math.random() * 900000).toString();
  } while (taken.has(candidate));
  return candidate;
}

export default function PaybillPage() {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"Reusable" | "One-time">("Reusable");
  const [amount, setAmount] = useState("");
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [newAcc, setNewAcc] = useState<AccountRow | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);

  function generate() {
    if (!label.trim()) return;
    const taken = new Set(rows.map((r) => r.acc));
    const row: AccountRow = { acc: randomAccountNumber(taken), label: label.trim(), type, collected: 0 };
    setRows((prev) => [row, ...prev]);
    setNewAcc(row);
    setLabel("");
    setAmount("");
  }

  return (
    <>
      <Header title="Paybill" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <div
          className="rounded-xl px-4 py-3 text-[12.5px] leading-relaxed"
          style={{ background: "var(--warn-bg)", color: "var(--warn-text)", border: "1px solid var(--warn-text)" }}
        >
          Preview only — paybill numbers and account numbers here are not registered with M-Pesa.
          Do not share them with customers until this feature is live.
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/checkout" className="text-[12.5px] font-semibold no-underline" style={{ color: "var(--muted)" }}>
            ← Checkout
          </Link>
          <button
            type="button"
            onClick={() => setPosterOpen(true)}
            className="ml-auto rounded-lg px-3.5 py-2.5 text-[12.5px] font-semibold"
            style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}
          >
            Print poster (preview)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section
            className="flex flex-col gap-3.5 rounded-xl p-5"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <span className="flex items-center gap-2">
              <span className="rounded px-1.5 py-1 text-[9.5px] font-extrabold" style={{ background: "#4a5560", color: "#fff" }}>PAYBILL</span>
              <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>Preview layout</span>
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <span className="mono text-[clamp(30px,5vw,40px)] font-semibold tracking-wide">———</span>
            </span>
            <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
              Your live paybill number will appear here once this product is enabled for your account.
            </span>
          </section>

          <section
            className="flex flex-col gap-3 rounded-xl p-5"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <h2 className="m-0 text-[15px] font-bold">How your customer will pay</h2>
            {["Go to M-Pesa > Lipa na M-Pesa > Pay Bill", "Enter your business paybill number", "Enter the account number shown", "Enter the amount and PIN"].map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold"
                  style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
                >
                  {i + 1}
                </span>
                <span className="text-[13px]">{step}</span>
              </span>
            ))}
          </section>
        </div>

        <section
          className="overflow-hidden rounded-xl"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <div className="p-4"><h2 className="m-0 text-[15px] font-bold">Generate an account number</h2></div>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Who or what it&apos;s for
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Wanjiru's Salon, or Invoice 1043"
                  style={inputStyle}
                />
              </label>
              <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)", width: "fit-content" }}>
                {(["Reusable", "One-time"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="rounded-md px-3 py-1.5 text-[12.5px] font-bold"
                    style={type === t ? { background: "var(--panel)" } : { color: "var(--muted)" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {type === "One-time" && (
                <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Amount to collect
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5,000" inputMode="numeric" style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono)" }} />
                </label>
              )}
              <button
                type="button"
                onClick={generate}
                className="self-start rounded-lg px-4 py-2.5 text-[13px] font-bold"
                style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
              >
                Generate account number
              </button>
            </div>
            <div>
              {newAcc ? (
                <div
                  className="flex flex-col gap-3 rounded-xl p-4"
                  style={{ border: "1px solid var(--indigo)", background: "var(--indigo-tint)" }}
                >
                  <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--indigo-text)" }}>
                    New account number
                  </span>
                  <span className="mono text-[26px] font-semibold tracking-wide">{newAcc.acc}</span>
                  <span
                    className="rounded-lg p-3 text-[12.5px] leading-relaxed"
                    style={{ background: "var(--panel-solid)", border: "1px solid var(--line)" }}
                  >
                    Preview message: pay to your assigned paybill, account {newAcc.acc} — {newAcc.label}
                  </span>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-1.5 rounded-xl p-4"
                  style={{ border: "1px dashed var(--border-strong)", background: "var(--surface-soft)" }}
                >
                  <span className="text-[12.5px] font-semibold">Your new number shows here</span>
                  <span className="text-[12px]" style={{ color: "var(--muted)" }}>With a message you can paste into WhatsApp or SMS.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5 p-4">
            <h2 className="m-0 text-[15px] font-bold">Account numbers</h2>
            <span className="ml-auto text-[12px]" style={{ color: "var(--muted)" }}>{rows.length} total</span>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
              No preview account numbers yet. Generate one above to try the layout.
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.acc} className="flex flex-wrap items-center gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
                <span className="flex min-w-[140px] flex-1 flex-col gap-0.5">
                  <span className="mono text-[13.5px] font-semibold">{r.acc}</span>
                  <span className="truncate text-[11.5px]" style={{ color: "var(--faint)" }}>{r.label}</span>
                </span>
                <span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: "var(--surface)", color: "var(--muted)" }}>{r.type}</span>
                <span className="mono text-[13px] font-semibold whitespace-nowrap">KES {r.collected.toLocaleString()}</span>
              </div>
            ))
          )}
        </section>
      </div>

      {posterOpen && (
        <PosterModal
          account={newAcc?.acc ?? rows[0]?.acc ?? "PREVIEW"}
          onClose={() => setPosterOpen(false)}
        />
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  width: "100%",
};
