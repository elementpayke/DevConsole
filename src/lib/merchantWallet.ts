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
