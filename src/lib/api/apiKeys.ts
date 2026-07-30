import { apiFetch } from "./client";
import type { ApiKeyCreateRequest, ApiKeyCreated, ApiKeyInfo } from "@/lib/types";

export function listApiKeys(token: string) {
  return apiFetch<ApiKeyInfo[]>("/users/me/api-keys", { token });
}

export function createApiKey(token: string, body: ApiKeyCreateRequest) {
  return apiFetch<ApiKeyCreated>("/api-keys", { method: "POST", body, token });
}

export function revokeApiKey(token: string, keyId: number) {
  return apiFetch<{ revoked: boolean; key_id: number }>(`/users/me/api-keys/${keyId}`, {
    method: "DELETE",
    token,
  });
}

export function updateApiKeyWebhook(
  token: string,
  keyId: number,
  webhook_url?: string,
  webhook_secret?: string,
) {
  return apiFetch<{ updated: boolean }>(`/users/me/api-keys/${keyId}/webhook`, {
    method: "PATCH",
    token,
    query: { webhook_url, webhook_secret },
  });
}
