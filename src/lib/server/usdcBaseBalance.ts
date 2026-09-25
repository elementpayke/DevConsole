/** USDC on Base (EIP-55 checksummed). */
export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const BALANCE_OF_SELECTOR = "0x70a08231";

function padAddressParam(address: string): string {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

/** ERC-20 balanceOf via JSON-RPC eth_call; returns human USDC (6 decimals) or null on failure. */
export async function fetchUsdcBalanceOnBase(
  ownerAddress: string,
  rpcUrl: string,
): Promise<number | null> {
  const owner = ownerAddress.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(owner)) return null;

  const data = `${BALANCE_OF_SELECTOR}${padAddressParam(owner)}`;
  let res: Response;
  try {
    res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          { to: BASE_USDC_ADDRESS, data },
          "latest",
        ],
      }),
      cache: "no-store",
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: string; error?: unknown };
  if (!json.result || typeof json.result !== "string") return null;
  try {
    const raw = BigInt(json.result);
    return Number(raw) / 1_000_000;
  } catch {
    return null;
  }
}
