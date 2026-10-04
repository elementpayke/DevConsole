"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

/** Indicative only — no live rate feed is wired up yet. Firm pricing happens over WhatsApp/Telegram/email. */
const INDICATIVE_RATE: Record<string, number> = { KES: 129, TZS: 2620, UGX: 3720, RWF: 1320, GHS: 15.4, NGN: 1550 };

export default function OtcPage() {
  const [side, setSide] = useState<"Buy" | "Sell">("Sell");
  const [asset, setAsset] = useState<"USDC" | "USDT">("USDC");
  const [chain, setChain] = useState("Base");
  const [amount, setAmount] = useState("20000");
  const [fiat, setFiat] = useState("KES");

  const rate = INDICATIVE_RATE[fiat] ?? 0;
  const amountNum = Number(amount) || 0;
  const fiatValue = amountNum * rate;

  const waMessage = useMemo(() => {
    const verb = side === "Sell" ? "sell" : "buy";
    return `Hi ElementPay OTC desk, I'd like to ${verb} $${amountNum.toLocaleString()} of ${asset} on ${chain} for ${fiat}.`;
  }, [side, amountNum, asset, chain, fiat]);

  return (
    <>
      <Header title="OTC desk" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <Link href="/wallets" className="self-start text-[12.5px] font-semibold no-underline" style={{ color: "var(--muted)" }}>
          ← Wallets
        </Link>

        <section
          className="flex flex-wrap items-center gap-6 rounded-xl p-4"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <span className="flex min-w-[240px] flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-bold">Large trades, priced by our desk</span>
            <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
              Buy or sell stablecoins against local currency in one block.
            </span>
          </span>
          <Fact label="Minimum" value="$20,000" />
          <Fact label="Desk hours" value="Mon–Fri · 08:00–18:00 EAT" />
          <Fact label="Settlement" value="Same day" />
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <section
            className="flex flex-col gap-4 rounded-xl p-[18px]"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)" }}>
              {(["Sell", "Buy"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className="flex-1 rounded-md py-2 text-[13px] font-bold"
                  style={side === s ? { background: "var(--panel)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : { color: "var(--muted)" }}
                >
                  {s} stablecoin
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Stablecoin
                <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)" }}>
                  {(["USDC", "USDT"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAsset(a)}
                      className="flex-1 rounded-md py-2 text-[12.5px] font-bold"
                      style={asset === a ? { background: "var(--panel)" } : { color: "var(--muted)" }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                Network
                <select value={chain} onChange={(e) => setChain(e.target.value)} style={selectStyle}>
                  {["Base", "Stellar", "Solana", "Polygon", "BSC"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Amount in USD
              <div className="flex items-center overflow-hidden rounded-lg" style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}>
                <span className="mono pl-3 text-[16px]" style={{ color: "var(--muted)" }}>$</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  className="mono flex-1 bg-transparent px-2.5 py-3 text-[18px] font-medium outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Settle in
              <select value={fiat} onChange={(e) => setFiat(e.target.value)} style={selectStyle}>
                {Object.keys(INDICATIVE_RATE).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <div
              className="flex flex-col overflow-hidden rounded-xl"
              style={{ border: "1px solid var(--line)", background: "var(--surface-soft)" }}
            >
              <span className="px-3.5 py-2 text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Indicative
              </span>
              <Row label="Rate" value={rate ? `1 ${asset} ≈ ${rate} ${fiat}` : "—"} />
              <Row label={`You'd ${side === "Sell" ? "receive" : "pay"}`} value={`${fiat} ${fiatValue.toLocaleString()}`} />
            </div>

            <a
              href={`https://wa.me/254700416313?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener"
              className="rounded-lg py-3 text-center text-[13.5px] font-bold no-underline"
              style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
            >
              Request firm quote on WhatsApp
            </a>
            <p className="text-[11.5px]" style={{ color: "var(--faint)" }}>
              Numbers above are indicative only. The desk confirms a firm, time-boxed price before you commit.
            </p>
          </section>

          <div className="flex flex-col gap-4">
            <section className="rounded-xl p-[18px]" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
              <h2 className="m-0 mb-2 text-[15px] font-bold">Talk to the desk</h2>
              <p className="mb-3 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                Above $1M, a different pair, or a quick question? A trader replies within minutes during desk hours.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://wa.me/254700416313?text=Hi%20ElementPay%20OTC%20desk"
                  target="_blank"
                  rel="noopener"
                  className="flex-1 rounded-lg py-2.5 text-center text-[12.5px] font-bold no-underline"
                  style={{ background: "#1fa855", color: "#fff" }}
                >
                  WhatsApp
                </a>
                <a
                  href="https://t.me/elementpay_otc"
                  target="_blank"
                  rel="noopener"
                  className="flex-1 rounded-lg py-2.5 text-center text-[12.5px] font-bold no-underline"
                  style={{ background: "#229ed9", color: "#fff" }}
                >
                  Telegram
                </a>
                <a
                  href="mailto:otc@elementpay.net?subject=OTC%20trade"
                  className="flex-1 rounded-lg py-2.5 text-center text-[12.5px] font-bold no-underline"
                  style={{ background: "var(--surface)", color: "var(--ink)" }}
                >
                  Email
                </a>
              </div>
            </section>

            <section className="rounded-xl p-[18px]" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
              <h2 className="m-0 mb-2 text-[15px] font-bold">Your OTC trades</h2>
              <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                Trades booked with the desk will show up here once confirmed.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

const selectStyle: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--panel-solid)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="text-[13.5px] font-semibold">{value}</span>
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-3 px-3.5 py-2.5" style={{ borderTop: "1px solid var(--line)" }}>
      <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="mono ml-auto text-[13px] font-semibold">{value}</span>
    </span>
  );
}
