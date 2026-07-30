"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ApiError } from "@/lib/api/client";
import type { ApiKeyCreated } from "@/lib/types";

export function CreateKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, webhookUrl: string, webhookSecret: string) => Promise<ApiKeyCreated>;
}) {
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate(name, webhookUrl, webhookSecret);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create API key.");
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="mb-1.5 text-base font-extrabold">Create API key</div>
      <p className="mb-5 text-[13.5px] text-muted">
        The full key is shown once, right after creation — store it securely.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Name</div>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production Server"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Webhook URL (optional)</div>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourapp.com/webhooks/elementpay"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Webhook secret (optional)</div>
          <PasswordInput
            minLength={8}
            maxLength={128}
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Used to sign webhook payloads (HMAC)"
          />
          <p className="mt-1.5 text-[11px] text-faint">8–128 characters. Only needed if a webhook URL is set.</p>
        </div>

        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}

        <div className="mt-1 flex gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating…" : "Create key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
