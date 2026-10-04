"use client";

import { useEffect, useState } from "react";

/**
 * Looping animation of the real hosted checkout (pay.elementpay.net), cycling
 * through all three settlement rails — M-Pesa, card, and crypto — so the
 * panel actually sells the "any rail, one integration" pitch instead of
 * showing a single static flow. The headline rotates with the active rail
 * and a webhook toast lands after each payment, aimed squarely at devs
 * skimming this screen while merchants read the money side.
 */

type RailId = "mpesa" | "card" | "crypto";
type Phase = "pick" | "processing" | "done";

type Rail = {
  id: RailId;
  label: string;
  note: string;
  headline: string;
  ref: string;
};

const RAILS: Rail[] = [
  {
    id: "mpesa",
    label: "M-Pesa",
    note: "Mobile money",
    headline: "One link. They pay the way they already do.",
    ref: "M-Pesa · SJK4H7Q2XP",
  },
  {
    id: "card",
    label: "Visa / Mastercard",
    note: "Cards",
    headline: "Cards, wallets, mobile money — one checkout.",
    ref: "Visa •••• 4242",
  },
  {
    id: "crypto",
    label: "USDC",
    note: "Base, Solana, more",
    headline: "Stablecoins settle in seconds. No seed phrase required.",
    ref: "USDC on Base · 0x8f3a…e92b",
  },
];

const DURATIONS: Record<Phase, number> = {
  pick: 1700,
  processing: 2200,
  done: 2100,
};

const TICKER = [
  { text: "Payment received · Nairobi", amt: "KES 5,000", via: "M-Pesa" },
  { text: "Payment received · Lagos", amt: "USDC 32.40", via: "Crypto" },
  { text: "Payment received · Kampala", amt: "UGX 18,500", via: "M-Pesa" },
  { text: "Payment received · Accra", amt: "GHS 620", via: "Card" },
];

export function CheckoutSimPanel() {
  const [railIndex, setRailIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("pick");
  const [selected, setSelected] = useState(false);
  const [pinFilled, setPinFilled] = useState(0);
  const [cardDigits, setCardDigits] = useState(0);
  const [showWebhook, setShowWebhook] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const rail = RAILS[railIndex];

  useEffect(() => {
    const advance = setTimeout(() => {
      if (phase === "pick") setPhase("processing");
      else if (phase === "processing") setPhase("done");
      else {
        setPhase("pick");
        setRailIndex((i) => (i + 1) % RAILS.length);
      }
    }, DURATIONS[phase]);
    return () => clearTimeout(advance);
  }, [phase]);

  useEffect(() => {
    // Resets the pick-animation flags whenever the phase/rail changes, not just on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(false);
    setShowWebhook(false);
    if (phase !== "pick") return;
    const t = setTimeout(() => setSelected(true), 600);
    return () => clearTimeout(t);
  }, [phase, railIndex]);

  useEffect(() => {
    if (phase !== "processing") {
      // Resets the processing counters whenever we leave the processing phase.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPinFilled(0);
      setCardDigits(0);
      return;
    }
    if (rail.id === "mpesa") {
      const step = setInterval(() => setPinFilled((n) => (n < 4 ? n + 1 : n)), 420);
      return () => clearInterval(step);
    }
    if (rail.id === "card") {
      const step = setInterval(() => setCardDigits((n) => (n < 4 ? n + 1 : n)), 380);
      return () => clearInterval(step);
    }
  }, [phase, rail.id]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setShowWebhook(true), 450);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const tick = setInterval(() => setTickerIndex((i) => (i + 1) % TICKER.length), 2600);
    return () => clearInterval(tick);
  }, []);

  const currentTicker = TICKER[tickerIndex];

  return (
    <aside
      className="relative hidden min-h-[560px] flex-col gap-6 overflow-hidden rounded-[22px] p-7 lg:flex"
      style={{ border: "1px solid rgba(67,57,202,0.14)" }}
    >
      <span
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(rgba(67,57,202,0.10) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />
      <div className="relative flex flex-col gap-2">
        <span className="text-[11.5px] font-semibold text-primary">What your customers see</span>
        <h2
          key={rail.id}
          className="m-0 max-w-[26ch] text-[26px] leading-tight font-bold tracking-tight text-ink animate-fade-in"
          style={{ minHeight: "2.4em" }}
        >
          {rail.headline}
        </h2>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div
          className="force-light-surface w-full max-w-[320px] overflow-hidden rounded-[18px] border border-line bg-white"
          style={{ boxShadow: "0 24px 50px -24px rgba(67,57,202,0.35)" }}
        >
          <div className="flex items-center gap-1.5 border-b border-[#eceef0] bg-[#f6f7f8] px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full border border-[#8b9199]" />
            <span className="mono text-[10px] text-[#8b9199]">pay.elementpay.net/c/acme</span>
          </div>
          <div className="flex flex-col gap-3.5 p-4" style={{ minHeight: 318 }}>
            <span className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white">
                AC
              </span>
              <span className="text-[12.5px] font-bold">Acme Commerce</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[12px] text-[#5e656d]">Standard cart</span>
              <span className="mono text-[24px] font-semibold tracking-tight">KES 5,000</span>
            </span>

            {phase === "pick" && (
              <div key={`pick-${rail.id}`} className="flex animate-fade-in flex-col gap-1.5">
                {RAILS.map((r) => {
                  const isActive = r.id === rail.id;
                  const isSelected = isActive && selected;
                  return (
                    <span
                      key={r.id}
                      className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 transition-colors duration-300"
                      style={{
                        borderColor: isSelected ? "#4339ca" : "#e7e9ec",
                        background: isSelected ? "#f0effc" : "transparent",
                      }}
                    >
                      <RailMark id={r.id} />
                      <span className="flex flex-col">
                        <span className="text-[12.5px] font-bold">{r.label}</span>
                        <span className="text-[10.5px] text-[#6b727a]">{r.note}</span>
                      </span>
                      {isSelected && (
                        <span className="animate-fade-in ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#4339ca] text-[9px] font-bold text-white">
                          ✓
                        </span>
                      )}
                    </span>
                  );
                })}
                <span
                  className="mt-1.5 rounded-[10px] py-3 text-center text-[13px] font-bold text-white transition-opacity duration-300"
                  style={{ background: "#4339ca", opacity: selected ? 1 : 0.5 }}
                >
                  Pay KES 5,000
                </span>
              </div>
            )}

            {phase === "processing" && rail.id === "mpesa" && (
              <div key="processing-mpesa" className="flex flex-1 animate-fade-in flex-col items-center justify-center gap-3 py-2 text-center">
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-[#f0effc]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4339ca" strokeWidth={2} strokeLinecap="round">
                    <rect x="6" y="2" width="12" height="20" rx="2.5" />
                    <path d="M11 18h2" />
                  </svg>
                </span>
                <span className="text-[14px] font-bold">Enter M-Pesa PIN</span>
                <span className="text-[12px] text-[#5e656d]">Sent to 0712 ••• 678</span>
                <span className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 rounded-full transition-colors duration-200"
                      style={{ background: i < pinFilled ? "#4339ca" : "#e7e9ec" }}
                    />
                  ))}
                </span>
              </div>
            )}

            {phase === "processing" && rail.id === "card" && (
              <div key="processing-card" className="flex flex-1 animate-fade-in flex-col items-center justify-center gap-3 py-2">
                <div
                  className="flex w-full flex-col gap-3 rounded-xl p-3.5 text-white"
                  style={{ background: "linear-gradient(135deg, #4339ca, #2a2385)" }}
                >
                  <span className="flex items-center justify-between">
                    <span className="h-5 w-7 rounded-[3px]" style={{ background: "rgba(255,255,255,0.35)" }} />
                    <span className="text-[9px] font-bold tracking-wide opacity-80">VISA</span>
                  </span>
                  <span className="mono text-[13px] tracking-[0.12em]">
                    {["••••", "••••", "••••", cardDigits >= 4 ? "4242" : "••••"].join("  ")}
                  </span>
                  <span className="flex justify-between text-[9.5px] opacity-80">
                    <span>12 / 28</span>
                    <span>CVC •••</span>
                  </span>
                </div>
                <span className="flex items-center gap-2 text-[12px] text-[#5e656d]">
                  <span
                    className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 animate-spin-slow"
                    style={{ borderColor: "#e7e9ec", borderTopColor: "#4339ca" }}
                  />
                  Processing payment…
                </span>
              </div>
            )}

            {phase === "processing" && rail.id === "crypto" && (
              <div key="processing-crypto" className="flex flex-1 animate-fade-in flex-col items-center justify-center gap-3 py-2 text-center">
                <span className="relative flex h-[64px] w-[64px] items-center justify-center rounded-2xl bg-[#f0effc]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4339ca" strokeWidth={1.8}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3M21 14v7h-7" />
                  </svg>
                  <span
                    className="absolute inset-0 rounded-2xl border-2 animate-spin-slow"
                    style={{ borderColor: "transparent", borderTopColor: "#4339ca" }}
                  />
                </span>
                <span className="text-[14px] font-bold">Waiting for wallet</span>
                <span className="mono text-[11px] text-[#6b727a]">0x9a2…44f1 · Base</span>
              </div>
            )}

            {phase === "done" && (
              <div key={`done-${rail.id}`} className="flex flex-1 animate-fade-in flex-col items-center justify-center gap-2.5 py-2 text-center">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[18px] font-bold text-white"
                  style={{ background: "oklch(0.6 0.16 152)" }}
                >
                  ✓
                </span>
                <span className="text-[15px] font-bold">Paid</span>
                <span className="mono text-[11px] text-[#5e656d]">{rail.ref}</span>
                {showWebhook && (
                  <span
                    className="mono animate-fade-in mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]"
                    style={{ background: "#16162a", color: "#8fe3a8" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#3ddc84" }} />
                    webhook → order.settled 200
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        key={tickerIndex}
        className="force-light-surface relative flex animate-fade-in items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3"
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[oklch(0.6_0.16_152)]" />
        <span className="flex-1 text-[12.5px] text-muted">{currentTicker.text}</span>
        <span className="mono text-[12px] whitespace-nowrap">{currentTicker.amt}</span>
      </div>
    </aside>
  );
}

function RailMark({ id }: { id: RailId }) {
  if (id === "crypto") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4339ca" strokeWidth={2} className="flex-shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M21 14v7h-7" />
      </svg>
    );
  }
  if (id === "card") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4339ca" strokeWidth={2} className="flex-shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  return <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#4339ca]" />;
}
