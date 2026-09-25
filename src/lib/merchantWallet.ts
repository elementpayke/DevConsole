/** Default chain for merchant treasury (Off-ramp collateral). */
export const MERCHANT_TREASURY_CHAIN = "base";

export type LinkedWallet = {
  wallet_id: number;
  address: string;
  chain: string;
  is_primary: boolean;
  wallet_type: string;
  label?: string | null;
  status: string;
};

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function isValidEvmAddress(value: string): boolean {
  return EVM_ADDRESS.test(value.trim());
}

/** Normalize aggregator list/envelope responses for merchant account selection. */
export function unwrapLinkedWalletsFromApi(json: unknown): LinkedWallet[] {
  if (Array.isArray(json)) return json as LinkedWallet[];
  if (json && typeof json === "object") {
    const data = (json as { data?: unknown }).data;
    if (Array.isArray(data)) return data as LinkedWallet[];
  }
  return [];
}

/** Prefer primary wallet on the treasury chain, else first active wallet. */
export function selectMerchantTreasuryWallet(
  wallets: LinkedWallet[],
): LinkedWallet | null {
  if (!wallets.length) return null;
  const active = wallets.filter((w) => w.status === "active");
  const pool = active.length ? active : wallets;
  const onChain = pool.filter(
    (w) => w.chain.toLowerCase() === MERCHANT_TREASURY_CHAIN,
  );
  const scoped = onChain.length ? onChain : pool;
  return scoped.find((w) => w.is_primary) ?? scoped[0] ?? null;
}
