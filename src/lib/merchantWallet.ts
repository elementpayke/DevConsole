/** Default chain for merchant treasury (Off-ramp collateral). */
export const MERCHANT_TREASURY_CHAIN = "base";

/** EVM chains users can create/register as a Console payout wallet. */
export const TREASURY_CHAIN_OPTIONS = [
  {
    id: "base",
    label: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
  },
  {
    id: "arbitrum",
    label: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  {
    id: "polygon",
    label: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
  },
  {
    id: "scroll",
    label: "Scroll",
    chainId: 534352,
    rpcUrl: "https://rpc.scroll.io",
  },
  {
    id: "optimism",
    label: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
  },
] as const;

export type TreasuryChainId = (typeof TREASURY_CHAIN_OPTIONS)[number]["id"];

export function isTreasuryChainId(value: string): value is TreasuryChainId {
  return TREASURY_CHAIN_OPTIONS.some((c) => c.id === value);
}

export function treasuryChainOption(id: string) {
  return TREASURY_CHAIN_OPTIONS.find((c) => c.id === id) ?? TREASURY_CHAIN_OPTIONS[0];
}

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
