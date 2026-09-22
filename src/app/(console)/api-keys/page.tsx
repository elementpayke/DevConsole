"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { ApiKeysTable } from "@/components/api-keys/ApiKeysTable";
import { CreateKeyModal } from "@/components/api-keys/CreateKeyModal";
import { RevealKeyModal } from "@/components/api-keys/RevealKeyModal";
import { EditWebhookModal } from "@/components/api-keys/EditWebhookModal";
import { useAuth } from "@/lib/auth/AuthContext";
import * as apiKeysApi from "@/lib/api/apiKeys";
import { ApiError } from "@/lib/api/client";
import type { ApiKeyCreated, ApiKeyInfo } from "@/lib/types";

export default function ApiKeysPage() {
  const { isAuthenticated } = useAuth();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<ApiKeyCreated | null>(null);
  const [editing, setEditing] = useState<ApiKeyInfo | null>(null);
  const [busyKeyId, setBusyKeyId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setKeys(await apiKeysApi.listApiKeys());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // refresh()'s setState calls all happen after an awaited network call,
    // not synchronously — safe despite the lint rule's static call-graph check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleCreate(name: string, webhookUrl: string, webhookSecret: string) {
    if (!isAuthenticated) throw new Error("Not authenticated");
    const created = await apiKeysApi.createApiKey({
      name,
      webhook_url: webhookUrl || undefined,
      webhook_secret: webhookSecret || undefined,
    });
    setCreating(false);
    setRevealed(created);
    refresh();
    return created;
  }

  async function handleRevoke(key: ApiKeyInfo) {
    if (!isAuthenticated) return;
    if (!confirm(`Revoke "${key.name}"? Requests using this key will stop working immediately.`)) {
      return;
    }
    try {
      await apiKeysApi.revokeApiKey(key.id);
      refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to revoke key.");
    }
  }

  async function handleSaveWebhook(webhookUrl: string, webhookSecret: string) {
    if (!isAuthenticated || !editing) return;
    await apiKeysApi.updateApiKeyWebhook(
      editing.id,
      webhookUrl || undefined,
      webhookSecret || undefined,
    );
    refresh();
  }

  async function handleToggleSms(key: ApiKeyInfo, next: boolean) {
    if (!isAuthenticated || key.revoked || busyKeyId === key.id) return;
    setBusyKeyId(key.id);
    try {
      await apiKeysApi.updateApiKeySms(key.id, next);
      await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update SMS notifications.");
    } finally {
      setBusyKeyId(null);
    }
  }

  async function handleToggleSignedOrders(key: ApiKeyInfo, next: boolean) {
    if (!isAuthenticated || key.revoked || busyKeyId === key.id) return;
    setBusyKeyId(key.id);
    try {
      await apiKeysApi.updateApiKeySignedOrders(key.id, next);
      await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update signed accepts.");
    } finally {
      setBusyKeyId(null);
    }
  }

  return (
    <>
      <Header title="API Keys" />
      <div className="p-7">
        <div className="mb-[22px] flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-[22px] font-extrabold tracking-tight">Integration keys</h1>
            <p className="max-w-[520px] text-sm text-muted">
              Keys authenticate your server-to-server requests. Full values are shown once, at
              creation — we never store or display them again.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="px-[18px] py-2.5">
            + Create API key
          </Button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading keys…</p>
        ) : (
          <ApiKeysTable
            keys={keys}
            busyKeyId={busyKeyId}
            onEditWebhook={setEditing}
            onRevoke={handleRevoke}
            onToggleSms={handleToggleSms}
            onToggleSignedOrders={handleToggleSignedOrders}
          />
        )}
      </div>

      {creating && <CreateKeyModal onClose={() => setCreating(false)} onCreate={handleCreate} />}
      {revealed && <RevealKeyModal apiKey={revealed} onClose={() => setRevealed(null)} />}
      {editing && (
        <EditWebhookModal apiKey={editing} onClose={() => setEditing(null)} onSave={handleSaveWebhook} />
      )}
    </>
  );
}
