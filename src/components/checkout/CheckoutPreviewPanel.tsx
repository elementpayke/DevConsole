"use client";

import { Modal } from "@/components/ui/Modal";
import { absoluteCollectUrl, type CollectProfile, type PaymentLink } from "@/lib/api/collect";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type Method = { key: "mpesa" | "cards" | "stable"; label: string; note: string; enabled: boolean };

/** Live "what the customer sees" preview, driven by the merchant's real collect profile and link. */
export function CheckoutPreviewPanel({
  profile,
  link,
  onClose,
}: {
  profile: CollectProfile;
  link: PaymentLink;
  onClose: () => void;
}) {
  const methods: Method[] = [
    { key: "mpesa", label: "M-Pesa", note: "Approve on your handset · instant", enabled: profile.allow_mpesa },
    { key: "cards", label: "Card", note: "Visa · Mastercard, 3-D Secure", enabled: profile.allow_cards },
    { key: "stable", label: "Stablecoin", note: "USDC/USDT · on-chain", enabled: profile.allow_stable },
  ];
  const enabledFirst = [...methods].sort((a, b) => Number(b.enabled) - Number(a.enabled));

  return (
    <Modal onClose={onClose} width={420}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
          What the customer sees
        </span>
        <span className="mono text-[11px]" style={{ color: "var(--faint)" }}>pay.elementpay.net</span>
      </div>

      <div className="force-light-surface flex flex-col items-center rounded-xl p-5" style={{ border: "1px solid var(--line)" }}>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold"
          style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
        >
          {initials(profile.display_name)}
        </span>
        <span className="mt-2 text-[14px] font-bold">{profile.display_name}</span>

        <div className="mt-4 w-full rounded-xl p-4" style={{ border: "1px solid var(--line)" }}>
          <div className="mono text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--faint)" }}>
            {link.title}
          </div>
          <div className="mono mt-1 text-[28px] font-bold">
            {link.currency} {link.amount.toLocaleString()}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {enabledFirst.map((m, i) => (
              <div
                key={m.key}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5"
                style={{
                  border: `1px solid ${i === 0 && m.enabled ? "var(--indigo)" : "var(--line)"}`,
                  opacity: m.enabled ? 1 : 0.45,
                }}
              >
                <span>
                  <span className="block text-[13px] font-semibold">{m.label}</span>
                  <span className="block text-[11px]" style={{ color: "var(--muted)" }}>
                    {m.enabled ? m.note : "Not enabled — turn on in Settings"}
                  </span>
                </span>
                <span
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{
                    border: `1.5px solid ${i === 0 && m.enabled ? "var(--indigo)" : "var(--border-strong)"}`,
                    background: i === 0 && m.enabled ? "var(--indigo)" : "transparent",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <span className="mono mt-4 truncate text-[11px]" style={{ color: "var(--faint)" }}>
          {absoluteCollectUrl(link.public_path)}
        </span>
      </div>
    </Modal>
  );
}
