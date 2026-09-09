import { apiFetch } from "./client";
import type { ChainMeta, MetaEnv, TokenMeta } from "@/lib/types";

export function getChains(env: MetaEnv) {
  return apiFetch<ChainMeta[]>("/meta/chains", { query: { env } });
}

export function getTokens(env: MetaEnv) {
  return apiFetch<TokenMeta[]>("/meta/tokens", { query: { env } });
}
