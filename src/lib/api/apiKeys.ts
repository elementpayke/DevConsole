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

export function updateApiKeySms(keyId: number, send_sms_notifications: boolean) {
  return apiFetch<{ updated: boolean; key_id: number; send_sms_notifications: boolean }>(
    `/users/me/api-keys/${keyId}/sms`,
    {
      method: "PATCH",
      query: { send_sms_notifications },
    },
  );
}

export function updateApiKeySignedOrders(keyId: number, require_signed_orders: boolean) {
  return apiFetch<{ updated: boolean; key_id: number; require_signed_orders: boolean }>(
    `/users/me/api-keys/${keyId}/signed-orders`,
    {
      method: "PATCH",
      query: { require_signed_orders },
    },
  );
}
