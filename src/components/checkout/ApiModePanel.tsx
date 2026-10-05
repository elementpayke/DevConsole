"use client";

import Link from "next/link";

const SNIPPET = `curl https://<your-aggregator-host>/orders \\
  -H "x-api-key: $ELEMENTPAY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_address": "0xAbc...123",
    "token": "0x8335...0913",
    "order_type": 0,
    "fiat_payload": {
      "amount": 5000,
      "currency": "KES",
      "destination_type": "PHONE",
      "phone_number": "+2547XXXXXXXX"
    }
  }'`;

export function ApiModePanel() {
  return (
    <section
      className="flex flex-col gap-3.5 rounded-xl p-[18px]"
      style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[16px] font-bold">Call the API yourself</span>
        <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>Build your own payment screen.</span>
      </div>
      <pre
        className="mono m-0 overflow-x-auto rounded-xl p-3.5 text-[12px] leading-relaxed"
        style={{ border: "1px solid var(--code-line)", background: "var(--code-bg)", color: "var(--code-text)" }}
      >
        {SNIPPET}
      </pre>
      <Link
        href="/reference"
        className="self-start rounded-lg px-3.5 py-2.5 text-[12.5px] font-semibold no-underline"
        style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--ink)" }}
      >
        Open API reference
      </Link>
    </section>
  );
}
