"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { colors } from "@/lib/theme";
import type { ApiKeyCreated } from "@/lib/types";

function mask(key: string) {
  if (key.length <= 14) return key;
  return `${key.slice(0, 8)}${"•".repeat(Math.max(key.length - 14, 8))}${key.slice(-6)}`;
}

export function RevealKeyModal({ apiKey, onClose }: { apiKey: ApiKeyCreated; onClose: () => void }) {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const envPalette = apiKey.environment === "live" ? colors.success : colors.sandbox;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: colors.operational }} />
        <span className="text-base font-extrabold">API key created</span>
      </div>
      <p className="mb-5 text-[13.5px] text-muted">
        Copy it now — this is the only time the full value is shown.
      </p>

      <div className="mb-4 flex gap-5">
        <div>
          <div className="mb-1 text-[11px] font-bold tracking-wide text-faint uppercase">Name</div>
          <div className="text-[13.5px] font-bold">{apiKey.name}</div>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-bold tracking-wide text-faint uppercase">Environment</div>
          <Badge bg={envPalette.bg} color={envPalette.text}>
            {apiKey.environment === "live" ? "Live" : "Sandbox"}
          </Badge>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-line-strong bg-[oklch(0.98_0.003_264)] px-4 py-3.5">
        <code className="mono flex-1 text-[13px] break-all">
          {visible ? apiKey.key : mask(apiKey.key)}
        </code>
        <span
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer text-xs font-bold whitespace-nowrap text-primary"
        >
          {visible ? "Hide" : "Show"}
        </span>
      </div>

      <div
        className="mb-5 rounded-lg border px-3.5 py-3 text-[12.5px] leading-relaxed"
        style={{
          background: "oklch(0.97 0.03 80)",
          borderColor: "oklch(0.88 0.06 80)",
          color: "oklch(0.42 0.1 80)",
        }}
      >
        Store this in a secret manager or environment variable. It will not be shown again, and we
        do not offer a plaintext download for this reason.
      </div>

      <div className="flex gap-2.5">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Done
        </Button>
        <Button onClick={handleCopy} className="flex-1">
          {copied ? "Copied!" : "Copy key"}
        </Button>
      </div>
    </Modal>
  );
}
