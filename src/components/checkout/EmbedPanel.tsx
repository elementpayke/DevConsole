"use client";

import { useState } from "react";

const SNIPPET = `<script src="https://js.elementpay.net/v1/checkout.js"></script>
<button onclick="ElementPay.checkout({ amount: 5000, currency: 'KES' })">
  Pay KES 5,000
</button>`;

export function EmbedPanel() {
  const [domains, setDomains] = useState<string[]>(["acme.co.ke"]);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  function addDomain() {
    const host = draft.trim().toLowerCase();
    if (!host || domains.includes(host)) return;
    setDomains((prev) => [...prev, host]);
    setDraft("");
  }

  function copySnippet() {
    navigator.clipboard?.writeText(SNIPPET).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      className="flex flex-col gap-4 rounded-xl p-[18px]"
      style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[16px] font-bold">Embed on your site</span>
        <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>Pick how checkout appears on your page.</span>
      </span>

      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{ border: "1px solid var(--code-line)", background: "var(--code-bg)" }}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ borderBottom: "1px solid var(--code-line)" }}>
          <span className="text-[11px]" style={{ color: "var(--faint)" }}>index.html</span>
          <button
            type="button"
            onClick={copySnippet}
            className="ml-auto rounded-md px-2.5 py-1.5 text-[11.5px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <pre className="mono m-0 overflow-x-auto p-3.5 text-[12px] leading-relaxed" style={{ color: "var(--code-text)" }}>
          {SNIPPET}
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-bold">Allowed websites</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {domains.map((d) => (
            <span
              key={d}
              className="mono flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-2.5 text-[11.5px]"
              style={{ background: "var(--surface)" }}
            >
              {d}
              <button
                type="button"
                onClick={() => setDomains((prev) => prev.filter((x) => x !== d))}
                aria-label={`Remove ${d}`}
                className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                style={{ color: "var(--muted)" }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDomain()}
            placeholder="Add a domain, press Enter"
            className="min-w-[160px] flex-1 rounded-full px-2.5 py-1.5 text-[12px]"
            style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
          />
        </div>
        <span className="text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Checkout only loads on these domains. Confirm each payment on your server with the{" "}
          <span className="mono">order.settled</span> webhook.
        </span>
      </div>
    </section>
  );
}
