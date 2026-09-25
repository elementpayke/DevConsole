import { apiFetch } from "./client";
import type { LinkedWallet } from "@/lib/merchantWallet";

export function listLinkedWallets() {
  return apiFetch<LinkedWallet[]>("/auth/wallets", {
    unwrap: false,
    absolutePath: "/api/auth/wallets",
  });
}

export function connectLinkedWallet(body: { address: string; chain: string }) {
  return apiFetch<LinkedWallet>("/auth/connect-wallet", {
    method: "POST",
    body,
    absolutePath: "/api/auth/connect-wallet",
  });
}
