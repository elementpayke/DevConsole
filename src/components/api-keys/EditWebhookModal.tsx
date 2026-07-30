"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ApiError } from "@/lib/api/client";
import type { ApiKeyInfo } from "@/lib/types";

export function EditWebhookModal({
  apiKey,
  onClose,
  onSave,
}: {
  apiKey: ApiKeyInfo;
  onClose: () => void;
  onSave: (webhookUrl: string, webhookSecret: string) => Promise<void>;
}) {
  const [webhookUrl, setWebhookUrl] = useState(apiKey.webhook_url ?? "");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave(webhookUrl, webhookSecret);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update webhook.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} width={440}>
      <div className="mb-1.5 text-base font-extrabold">Webhook for {apiKey.name}</div>
      <p className="mb-5 text-[13.5px] text-muted">
        We&apos;ll POST order events to this URL as they happen.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Webhook URL</div>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourapp.com/webhooks/elementpay"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Webhook secret</div>
          <PasswordInput
            minLength={8}
            maxLength={128}
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Leave blank to keep the current secret"
          />
          <p className="mt-1.5 text-[11px] text-faint">
            Write-only — we never display an existing secret. Leave blank to keep it unchanged.
          </p>
        </div>
        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
