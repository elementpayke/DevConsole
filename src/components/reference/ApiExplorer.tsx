"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { colors } from "@/lib/theme";
import { useEnvironment, type Environment } from "@/lib/env/EnvContext";

function endpointsFor(env: Environment) {
  return [
  {
    id: "create-order",
    method: "POST",
    path: "/orders",
    desc: "Create a new on-ramp or off-ramp order.",
    requestCode: `curl https://<your-aggregator-host>/orders \\
  -H "x-api-key: $ELEMENTPAY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_address": "0xAbc...123",
    "token": "0x8335...0913",
    "order_type": 1,
    "fiat_payload": {
      "amount": 5000,
      "currency": "KES",
      "destination_type": "PHONE",
      "phone_number": "+2547XXXXXXXX"
    }
  }'`,
    responseCode: `{
  "status": "success",
  "message": "Order created",
  "data": {
    "order_id": "a1b2c3...",
    "status": "pending",
    "amount_crypto": 38.42,
    "amount_fiat": 5000,
    "currency": "KES"
  }
}`,
  },
  {
    id: "get-order",
    method: "GET",
    path: "/orders/{order_id}",
    desc: "Retrieve the current status of an order.",
    requestCode: `curl https://<your-aggregator-host>/orders/a1b2c3... \\
  -H "x-api-key: $ELEMENTPAY_API_KEY"`,
    responseCode: `{
  "status": "success",
  "message": "Order fetched successfully",
  "data": {
    "order_id": "a1b2c3...",
    "status": "settled",
    "settlement_transaction_hash": "0x4a1f...9c3e"
  }
}`,
  },
  {
    id: "quote",
    method: "GET",
    path: "/quote",
    desc: "Preview a quote before creating an order — no funds move, no API key required.",
    requestCode: `curl "https://<your-aggregator-host>/quote?order_type=offramp&amount_fiat=5000&token=USDC"`,
    responseCode: `{
  "rate": 130.14,
  "token_amount": 38.42,
  "fiat_paid": 5000,
  "symbol": "USDC",
  "decimals": 6
}`,
  },
  {
    id: "meta-tokens",
    method: "GET",
    path: "/meta/tokens",
    desc: "List supported tokens and chains for an environment.",
    requestCode: `curl "https://<your-aggregator-host>/meta/tokens?env=${env}"`,
    responseCode: `{
  "status": "success",
  "message": "Tokens fetched (1)",
  "data": [
    { "symbol": "USDC", "chain_name": "Base Sepolia", "chain_id": 84532, "decimals": 6 }
  ]
}`,
  },
  {
    id: "my-orders",
    method: "GET",
    path: "/orders/me",
    desc: "List orders for the authenticated user.",
    requestCode: `curl "https://<your-aggregator-host>/orders/me?status_filter=settled" \\
  -H "Authorization: Bearer $ACCESS_TOKEN"`,
    responseCode: `{
  "status": "success",
  "message": "Orders fetched (12)",
  "data": [ { "order_id": "a1b2c3...", "status": "settled", "token": "USDC" } ]
}`,
  },
];
}

export function ApiExplorer() {
  const { environment } = useEnvironment();
  const endpoints = endpointsFor(environment);
  const [activeId, setActiveId] = useState(endpoints[0].id);
  const [copied, setCopied] = useState(false);
  const active = endpoints.find((e) => e.id === activeId) ?? endpoints[0];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active.requestCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-5">
      <GlassCard className="h-fit p-2.5">
        {endpoints.map((ep) => (
          <div
            key={ep.id}
            onClick={() => setActiveId(ep.id)}
            className="mb-0.5 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5"
            style={{ background: ep.id === activeId ? colors.primaryTint : "transparent" }}
          >
            <span
              className="mono w-9 flex-shrink-0 text-[10px] font-extrabold"
              style={{ color: ep.method === "GET" ? colors.methodGet : colors.methodPost }}
            >
              {ep.method}
            </span>
            <span className="text-[12.5px] font-semibold">{ep.path}</span>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="p-[22px]">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span
            className="mono text-[11px] font-extrabold"
            style={{ color: active.method === "GET" ? colors.methodGet : colors.methodPost }}
          >
            {active.method}
          </span>
          <span className="mono text-sm font-bold">{active.path}</span>
        </div>
        <p className="mb-[18px] text-[13px] text-muted">{active.desc}</p>

        <div className="mb-4 rounded-xl p-5" style={{ background: "oklch(0.16 0.014 264)" }}>
          <div
            className="mb-2.5 text-[11.5px] font-bold tracking-wide uppercase"
            style={{ color: "oklch(0.7 0.03 264)" }}
          >
            Request
          </div>
          <pre
            className="mono m-0 text-[12.5px] leading-relaxed whitespace-pre-wrap"
            style={{ color: "oklch(0.9 0.01 264)" }}
          >
            {active.requestCode}
          </pre>
        </div>

        <div
          className="mb-[18px] rounded-xl border border-line px-[22px] py-5"
          style={{ background: "oklch(0.97 0.004 264)" }}
        >
          <div className="mb-2.5 text-[11.5px] font-bold tracking-wide text-subtle uppercase">
            Response
          </div>
          <pre className="mono m-0 text-[12.5px] leading-relaxed whitespace-pre-wrap text-[oklch(0.3_0.015_264)]">
            {active.responseCode}
          </pre>
        </div>

        <Button onClick={handleCopy}>{copied ? "Copied!" : "Copy as curl"}</Button>
      </GlassCard>
    </div>
  );
}
