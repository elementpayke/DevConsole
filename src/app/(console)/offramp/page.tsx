"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import {
  acceptOfframpQuote,
  createOfframpQuote,
  getMerchantPaymentAccountBalance,
  getOfframpCatalog,
  getOfframpCorridors,
  getOfframpOrder,
  type OfframpQuote,
} from "@/lib/api/offramp";
import { ApiError } from "@/lib/api/client";
import { countryDisplayLabel } from "@/lib/countryDisplay";
import {
  extractCatalogCurrency,
  extractCatalogProviders,
  listCatalogDestinationMethods,
  parseOfframpCorridors,
  type DestinationMethod,
  type OfframpCorridor,
} from "@/lib/offrampDiscovery";

const DEFAULT_ASSET = {
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  currency: "USDC",
  network: "BASE",
} as const;

const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

const DESTINATION_LABELS: Record<DestinationMethod, string> = {
  mobile_money: "Mobile money",
  bank: "Bank",
};

function clearQuoteBoundFields(
  setQuote: (q: OfframpQuote | null) => void,
  setOrderId: (id: string | null) => void,
  setOrderStatus: (s: string | null) => void,
) {
  setQuote(null);
  setOrderId(null);
  setOrderStatus(null);
}

function formatUsdcBalance(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OfframpPage() {
  const { isMerchant } = useMerchantExperience();
  const [corridors, setCorridors] = useState<OfframpCorridor[]>([]);
  const [catalogState, setCatalogState] = useState<{
    country: string;
    data: unknown;
  } | null>(null);
  const [country, setCountry] = useState("TZ");
  const [method, setMethod] = useState<DestinationMethod>("mobile_money");
  const [networkId, setNetworkId] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [refundAddress, setRefundAddress] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("20");
  const [quote, setQuote] = useState<OfframpQuote | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingCorridors, setLoadingCorridors] = useState(true);
  const [balanceUsdc, setBalanceUsdc] = useState<number | null | undefined>(
    undefined,
  );
  const [balanceStatus, setBalanceStatus] = useState<
    "ok" | "unavailable" | "no_account" | "load_failed" | undefined
  >(undefined);
  const [loadingPaymentAccount, setLoadingPaymentAccount] = useState(true);
  const [paymentAccountError, setPaymentAccountError] = useState<string | null>(
    null,
  );

  const paymentAccountReq = useRef(0);

  const loadPaymentAccount = useCallback(() => {
    const reqId = ++paymentAccountReq.current;
    setLoadingPaymentAccount(true);
    setPaymentAccountError(null);
    return getMerchantPaymentAccountBalance()
      .then((data) => {
        if (reqId !== paymentAccountReq.current) return;
        setBalanceUsdc(data.balance_usdc);
        setBalanceStatus(data.balance_status ?? (data.has_account ? "ok" : "no_account"));
        if (data.has_account && data.address) {
          setRefundAddress(data.address);
        } else {
          setRefundAddress("");
        }
      })
      .catch((err) => {
        if (reqId !== paymentAccountReq.current) return;
        setBalanceUsdc(null);
        setBalanceStatus("load_failed");
        setRefundAddress("");
        setPaymentAccountError(
          err instanceof ApiError
            ? err.message
            : "Could not load payment account. Try again.",
        );
      })
      .finally(() => {
        if (reqId !== paymentAccountReq.current) return;
        setLoadingPaymentAccount(false);
      });
  }, []);

  useEffect(() => {
    if (!isMerchant) return;
    let cancelled = false;
    getOfframpCorridors()
      .then((data) => {
        if (cancelled) return;
        const rows = parseOfframpCorridors(data);
        setCorridors(rows);
        if (rows.length > 0) {
          setCountry((prev) =>
            rows.some((r) => r.country === prev) ? prev : rows[0].country,
          );
        } else {
          setCountry("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load destinations.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCorridors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isMerchant]);

  useEffect(() => {
    if (!isMerchant || !country) return;
    let cancelled = false;
    getOfframpCatalog(country)
      .then((data) => {
        if (!cancelled) {
          setCatalogState({ country, data });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load providers.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isMerchant, country]);

  useEffect(() => {
    if (!isMerchant) return;
    queueMicrotask(() => {
      void loadPaymentAccount();
    });
  }, [isMerchant, loadPaymentAccount]);

  const catalog =
    catalogState?.country === country ? catalogState.data : null;

  const corridorCurrency = useMemo(() => {
    const row = corridors.find((c) => c.country === country);
    if (row?.currency) return row.currency;
    return extractCatalogCurrency(catalog, country);
  }, [corridors, country, catalog]);

  const availableMethods = useMemo(
    () => listCatalogDestinationMethods(catalog, country),
    [catalog, country],
  );

  const activeMethod: DestinationMethod = availableMethods.includes(method)
    ? method
    : (availableMethods[0] ?? "mobile_money");

  const providers = useMemo(
    () => extractCatalogProviders(catalog, country, activeMethod),
    [catalog, country, activeMethod],
  );
  const selectedNetworkId = providers.some((p) => p.id === networkId)
    ? networkId
    : (providers[0]?.id ?? "");

  function resolveQuoteCurrency(): string {
    if (corridorCurrency) return corridorCurrency;
    throw new Error(
      `No fiat currency for ${country}. Pick another destination country.`,
    );
  }

  async function handleQuote() {
    setBusy(true);
    setError(null);
    clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
    try {
      const refund = refundAddress.trim();
      if (!EVM_ADDRESS_RE.test(refund)) {
        throw new Error(
          "Link a payment account before withdrawing. Set up under Profile → Payment account.",
        );
      }
      const amount = Number(cryptoAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter a valid amount.");
      }
      if (!selectedNetworkId) throw new Error("Select a destination network.");
      const payment_method =
        activeMethod === "mobile_money"
          ? {
              type: "mobile_money" as const,
              phone_number: phone.trim(),
              network_id: selectedNetworkId,
            }
          : {
              type: "bank" as const,
              account_number: accountNumber.trim(),
              account_name: accountName.trim(),
              network_id: selectedNetworkId,
            };
      const q = await createOfframpQuote({
        currency: resolveQuoteCurrency(),
        country,
        crypto_amount: amount,
        asset: { ...DEFAULT_ASSET },
        payment_method,
        refund_address: refund,
      });
      setQuote(q);
      void loadPaymentAccount();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Quote failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept() {
    if (!quote?.quote_id) return;
    setBusy(true);
    setError(null);
    try {
      const accepted = await acceptOfframpQuote(quote.quote_id);
      const data = accepted as {
        order?: { order_id?: string; status?: string };
        data?: { order?: { order_id?: string; status?: string } };
      };
      const order =
        data.order ??
        data.data?.order ??
        (accepted as { order?: { order_id?: string; status?: string } }).order;
      const id = order?.order_id;
      if (id) {
        setOrderId(id);
        setOrderStatus(order?.status ?? "processing");
        const polled = await getOfframpOrder(id);
        const status =
          (polled as { status?: string; order?: { status?: string } })?.status ??
          (polled as { order?: { status?: string } })?.order?.status;
        if (status) setOrderStatus(String(status));
      } else {
        setOrderStatus("accepted");
      }
      void loadPaymentAccount();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Accept failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!isMerchant) {
    return (
      <>
        <Header title="Off-ramp" />
        <div className="p-7">
          <GlassCard className="p-6">
            <p className="text-sm text-muted">
              Off-ramp withdraw is available for merchant accounts. Contact ElementPay
              ops if you need access.
            </p>
          </GlassCard>
        </div>
      </>
    );
  }

  const loadingCatalog =
    Boolean(country) && catalogState?.country !== country;
  const destinationsReady = corridors.length > 0 && !loadingCorridors;
  const accountReady =
    !loadingPaymentAccount &&
    !paymentAccountError &&
    EVM_ADDRESS_RE.test(refundAddress.trim());
  const canQuote =
    destinationsReady &&
    accountReady &&
    !loadingCatalog &&
    !busy &&
    availableMethods.length > 0 &&
    providers.length > 0 &&
    selectedNetworkId.length > 0;

  return (
    <>
      <Header title="Off-ramp" />
      <div className="p-7 max-w-2xl">
        <h1 className="mb-1 text-[22px] font-extrabold tracking-tight">Withdraw</h1>
        <p className="mb-6 text-sm text-muted">
          Send USDC from your payment account to mobile money or bank in supported
          markets.
        </p>

        <GlassCard className="mb-4 p-5">
          <div className="text-[11px] font-bold tracking-wide text-faint uppercase">
            Available balance
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="mono text-[26px] font-extrabold tracking-tight">
              {balanceUsdc === undefined ? "…" : formatUsdcBalance(balanceUsdc)}
            </span>
            <span className="text-[13px] font-semibold text-muted">USDC</span>
            <button
              type="button"
              className="text-[12px] font-semibold text-subtle underline disabled:opacity-50"
              disabled={loadingPaymentAccount}
              onClick={() => void loadPaymentAccount()}
            >
              Refresh
            </button>
          </div>
          {loadingPaymentAccount && balanceUsdc === undefined && (
            <p className="mt-2 text-[12px] text-muted">Loading payment account…</p>
          )}
          {paymentAccountError && (
            <p className="mt-2 text-[12px] text-[oklch(0.55_0.19_25)]">
              {paymentAccountError}
            </p>
          )}
          {!loadingPaymentAccount &&
            !paymentAccountError &&
            balanceStatus === "no_account" && (
              <p className="mt-2 text-[12px] text-muted">
                No payment account linked.{" "}
                <Link href="/account/setup" className="font-bold underline">
                  Set up account
                </Link>{" "}
                and fund USDC on Base from Profile.
              </p>
            )}
          {!loadingPaymentAccount &&
            !paymentAccountError &&
            balanceStatus === "unavailable" && (
              <p className="mt-2 text-[12px] text-muted">
                Balance could not be read from Base. Check{" "}
                <code className="text-[11px]">BASE_RPC_URL</code> or try Refresh.
              </p>
            )}
        </GlassCard>

        {error && (
          <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
            {error}
          </p>
        )}

        <GlassCard className="mb-4 space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[12px] font-semibold text-faint">
              Country
              <select
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                value={country}
                disabled={!destinationsReady}
                onChange={(e) => {
                  setCountry(e.target.value);
                  clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                }}
              >
                {corridors.length === 0 ? (
                  <option value="">
                    {loadingCorridors ? "Loading…" : "No destinations available"}
                  </option>
                ) : (
                  corridors.map((c) => (
                    <option key={c.country} value={c.country}>
                      {countryDisplayLabel(c.country, c.currency)}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Amount (USDC)
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                value={cryptoAmount}
                onChange={(e) => {
                  setCryptoAmount(e.target.value);
                  clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                }}
                inputMode="decimal"
              />
            </label>
          </div>

          {loadingCatalog ? (
            <p className="text-[13px] text-muted">Loading payout options…</p>
          ) : availableMethods.length === 0 ? (
            <p className="text-[13px] text-muted">
              No mobile money or bank payout is available for this country in the
              catalog yet. Try another country or contact ElementPay ops.
            </p>
          ) : (
            <>
              {availableMethods.length === 1 ? (
                <div className="text-[13px]">
                  <span className="text-[12px] font-semibold text-faint">
                    Destination type
                  </span>
                  <p className="mt-1 font-medium">
                    {DESTINATION_LABELS[availableMethods[0]]}
                  </p>
                </div>
              ) : (
                <label className="block text-[12px] font-semibold text-faint">
                  Destination type
                  <select
                    className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                    value={activeMethod}
                    onChange={(e) => {
                      setMethod(e.target.value as DestinationMethod);
                      clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                    }}
                  >
                    {availableMethods.map((m) => (
                      <option key={m} value={m}>
                        {DESTINATION_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {providers.length > 0 && (
                <label className="block text-[12px] font-semibold text-faint">
                  Provider
                  <select
                    className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                    value={selectedNetworkId}
                    onChange={(e) => {
                      setNetworkId(e.target.value);
                      clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                    }}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name ?? p.id}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          {activeMethod === "mobile_money" && availableMethods.length > 0 ? (
            <label className="block text-[12px] font-semibold text-faint">
              Phone (E.164)
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                placeholder="+255…"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                }}
              />
            </label>
          ) : activeMethod === "bank" && availableMethods.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[12px] font-semibold text-faint">
                Account number
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                  }}
                />
              </label>
              <label className="block text-[12px] font-semibold text-faint">
                Account name
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    clearQuoteBoundFields(setQuote, setOrderId, setOrderStatus);
                  }}
                />
              </label>
            </div>
          ) : null}

          <Button onClick={handleQuote} disabled={!canQuote}>
            {busy ? "Working…" : loadingPaymentAccount ? "Loading account…" : "Get quote"}
          </Button>
        </GlassCard>

        {quote && (
          <GlassCard className="mb-4 space-y-3 p-5">
            <div className="text-[14.5px] font-bold">Quote</div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <div className="text-[11.5px] text-faint">You send</div>
                <div className="mono font-bold">
                  {quote.amounts?.user_pays?.amount ?? cryptoAmount}{" "}
                  {quote.amounts?.user_pays?.currency ?? "USDC"}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-faint">You receive</div>
                <div className="mono font-bold">
                  {quote.amounts?.user_receives?.amount ?? "—"}{" "}
                  {quote.amounts?.user_receives?.currency ?? ""}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-faint">Rate</div>
                <div className="mono">{quote.amounts?.rate ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11.5px] text-faint">Expires</div>
                <div className="text-xs">
                  {quote.expires_at
                    ? new Date(quote.expires_at).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>
            <Button onClick={handleAccept} disabled={busy || !!orderId}>
              {orderId ? "Accepted" : "Confirm withdraw"}
            </Button>
          </GlassCard>
        )}

        {orderId && (
          <GlassCard className="p-5">
            <div className="text-[14.5px] font-bold">Order status</div>
            <p className="mt-2 mono text-[13px]">{orderId}</p>
            <p className="mt-1 text-[13px] text-muted">{orderStatus ?? "processing"}</p>
          </GlassCard>
        )}
      </div>
    </>
  );
}
