import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidEvmAddress,
  selectMerchantTreasuryWallet,
  unwrapLinkedWalletsFromApi,
  type LinkedWallet,
} from "../src/lib/merchantWallet";

const VALID = "0x1234567890123456789012345678901234567890";

function wallet(
  overrides: Partial<LinkedWallet> & Pick<LinkedWallet, "wallet_id" | "address">,
): LinkedWallet {
  return {
    chain: "base",
    is_primary: false,
    wallet_type: "self_custody",
    status: "active",
    ...overrides,
  };
}

describe("isValidEvmAddress", () => {
  it("accepts a 40-nibble hex address with 0x prefix", () => {
    assert.equal(isValidEvmAddress(VALID), true);
    assert.equal(isValidEvmAddress(`0x${VALID.slice(2).toUpperCase()}`), true);
    assert.equal(isValidEvmAddress(`  ${VALID}  `), true);
  });

  it("rejects missing or malformed values", () => {
    assert.equal(isValidEvmAddress(""), false);
    assert.equal(isValidEvmAddress("0x"), false);
    assert.equal(isValidEvmAddress("0x1234"), false);
    assert.equal(isValidEvmAddress(`${VALID}aa`), false);
    assert.equal(isValidEvmAddress(`0xgg${"0".repeat(38)}`), false);
    assert.equal(isValidEvmAddress(VALID.slice(2)), false);
    assert.equal(isValidEvmAddress(`0X${VALID.slice(2)}`), false);
  });
});

describe("unwrapLinkedWalletsFromApi", () => {
  const row = wallet({ wallet_id: 1, address: VALID });

  it("returns a bare array", () => {
    assert.deepEqual(unwrapLinkedWalletsFromApi([row]), [row]);
  });

  it("returns data from an envelope", () => {
    assert.deepEqual(unwrapLinkedWalletsFromApi({ data: [row] }), [row]);
  });

  it("returns empty for invalid shapes", () => {
    assert.deepEqual(unwrapLinkedWalletsFromApi(null), []);
    assert.deepEqual(unwrapLinkedWalletsFromApi({ data: null }), []);
    assert.deepEqual(unwrapLinkedWalletsFromApi({ data: {} }), []);
    assert.deepEqual(unwrapLinkedWalletsFromApi({ status: "success" }), []);
  });
});

describe("selectMerchantTreasuryWallet", () => {
  it("returns null for an empty list", () => {
    assert.equal(selectMerchantTreasuryWallet([]), null);
  });

  it("prefers active wallets over inactive", () => {
    const inactive = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      status: "inactive",
      is_primary: true,
    });
    const active = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
    });
    assert.equal(selectMerchantTreasuryWallet([inactive, active]), active);
  });

  it("falls back to inactive wallets when none are active", () => {
    const first = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      status: "inactive",
    });
    const second = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
      status: "inactive",
    });
    assert.equal(selectMerchantTreasuryWallet([first, second]), first);
  });

  it("prefers base chain when both base and evm are active", () => {
    const evmPrimary = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      chain: "evm",
      is_primary: true,
    });
    const base = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
      chain: "base",
    });
    assert.equal(selectMerchantTreasuryWallet([evmPrimary, base]), base);
  });

  it("matches treasury chain case-insensitively", () => {
    const upper = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      chain: "BASE",
    });
    const evm = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
      chain: "evm",
    });
    assert.equal(selectMerchantTreasuryWallet([evm, upper]), upper);
  });

  it("chooses primary within the scoped chain set", () => {
    const baseA = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
    });
    const basePrimary = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
      is_primary: true,
    });
    assert.equal(selectMerchantTreasuryWallet([baseA, basePrimary]), basePrimary);
  });

  it("uses first scoped wallet when no primary is set", () => {
    const first = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
    });
    const second = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
    });
    assert.equal(selectMerchantTreasuryWallet([first, second]), first);
  });

  it("uses evm active wallet when no base wallet is in the pool", () => {
    const evm = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      chain: "evm",
    });
    assert.equal(selectMerchantTreasuryWallet([evm]), evm);
  });

  it("scopes to inactive base wallets when no active wallets exist", () => {
    const evmInactive = wallet({
      wallet_id: 1,
      address: "0x1111111111111111111111111111111111111111",
      chain: "evm",
      status: "inactive",
      is_primary: true,
    });
    const baseInactive = wallet({
      wallet_id: 2,
      address: "0x2222222222222222222222222222222222222222",
      chain: "base",
      status: "inactive",
    });
    assert.equal(
      selectMerchantTreasuryWallet([evmInactive, baseInactive]),
      baseInactive,
    );
  });
});
