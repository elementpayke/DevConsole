import { apiFetch } from "./client";
import type { ApiKeyCreateRequest, ApiKeyCreated, ApiKeyInfo } from "@/lib/types";

export function listApiKeys() {
  return apiFetch<ApiKeyInfo[]>("/users/me/api-keys");
}

export function createApiKey(body: ApiKeyCreateRequest) {
  return apiFetch<ApiKeyCreated>("/api-keys", { method: "POST", body });
}

export function revokeApiKey(keyId: number) {
  return apiFetch<{ revoked: boolean; key_id: number }>(`/users/me/api-keys/${keyId}`, {
    method: "DELETE",
  });
}

export function updateApiKeyWebhook(
  keyId: number,
  webhook_url?: string,
  webhook_secret?: string,
) {
  return apiFetch<{ updated: boolean }>(`/users/me/api-keys/${keyId}/webhook`, {
    method: "PATCH",
    query: { webhook_url, webhook_secret },
  });
}
