"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import {
  acceptOfframpQuote,
  createOfframpQuote,
  getOfframpCatalog,
  getOfframpOrder,
  type OfframpQuote,
} from "@/lib/api/offramp";
import { ApiError } from "@/lib/api/client";

const DEFAULT_ASSET = {
  token: "0x833589fcd6edb6e08f4c7c32d4f71b54bdA02913",
  currency: "USDC",
  network: "BASE",
} as const;

/** EP-managed refund wallet placeholder — replace via env when ops sets a real one. */
const DEFAULT_REFUND =
  process.env.NEXT_PUBLIC_OFFRAMP_REFUND_ADDRESS ||
  "0x0000000000000000000000000000000000000001";

type Provider = { id: string; name?: string };

function extractProviders(catalog: unknown, country: string): Provider[] {
  if (!catalog || typeof catalog !== "object") return [];
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const offramp = (data.offramp ?? data) as Record<string, unknown>;
  const countries = (offramp.countries ?? {}) as Record<string, unknown>;
  const countryNode = (countries[country] ?? {}) as Record<string, unknown>;
  const methods = (countryNode.payment_methods ?? {}) as Record<string, unknown>;
  const momo = (methods.mobile_money ?? {}) as Record<string, unknown>;
  const bank = (methods.bank ?? {}) as Record<string, unknown>;
  const momoProviders = Array.isArray(momo.providers) ? momo.providers : [];
  const bankProviders = Array.isArray(bank.providers) ? bank.providers : [];
  return [...momoProviders, ...bankProviders]
    .map((p) => {
      const row = p as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        name: typeof row.name === "string" ? row.name : undefined,
      };
    })
    .filter((p) => p.id);
}

function extractCountries(catalog: unknown): string[] {
  if (!catalog || typeof catalog !== "object") return [];
  const root = catalog as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const offramp = (data.offramp ?? data) as Record<string, unknown>;
  const countries = (offramp.countries ?? {}) as Record<string, unknown>;
  return Object.keys(countries).sort();
}

export default function OfframpPage() {
  const { isMerchant, partnerCustomerId } = useMerchantExperience();
  const [catalog, setCatalog] = useState<unknown>(null);
  const [country, setCountry] = useState("TZ");
  const [method, setMethod] = useState<"mobile_money" | "bank">("mobile_money");
  const [networkId, setNetworkId] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("20");
  const [quote, setQuote] = useState<OfframpQuote | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setError(null);
    try {
      const data = await getOfframpCatalog(country || undefined);
      setCatalog(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load destinations.");
    } finally {
      setLoadingCatalog(false);
    }
  }, [country]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const countries = useMemo(() => extractCountries(catalog), [catalog]);
  const providers = useMemo(
    () => extractProviders(catalog, country),
    [catalog, country],
  );

  useEffect(() => {
    if (providers.length && !providers.some((p) => p.id === networkId)) {
      setNetworkId(providers[0]?.id ?? "");
    }
  }, [providers, networkId]);

  async function handleQuote() {
    setBusy(true);
    setError(null);
    setQuote(null);
    try {
      const amount = Number(cryptoAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter a valid amount.");
      }
      if (!networkId) throw new Error("Select a destination network.");
      const payment_method =
        method === "mobile_money"
          ? {
              type: "mobile_money" as const,
              phone_number: phone.trim(),
              network_id: networkId,
            }
          : {
              type: "bank" as const,
              account_number: accountNumber.trim(),
              account_name: accountName.trim(),
              network_id: networkId,
            };
      const q = await createOfframpQuote({
        currency: country === "TZ" ? "TZS" : country === "KE" ? "KES" : "UGX",
        country,
        crypto_amount: amount,
        asset: { ...DEFAULT_ASSET },
        payment_method,
        refund_address: DEFAULT_REFUND,
      });
      setQuote(q);
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

  return (
    <>
      <Header title="Off-ramp" />
      <div className="p-7 max-w-2xl">
        <h1 className="mb-1 text-[22px] font-extrabold tracking-tight">Withdraw</h1>
        <p className="mb-6 text-sm text-muted">
          Send funds to mobile money or bank. Linked customer:{" "}
          <span className="mono text-xs">{partnerCustomerId ?? "—"}</span>
        </p>

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
                onChange={(e) => setCountry(e.target.value)}
              >
                {(countries.length ? countries : ["TZ", "KE", "UG"]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] font-semibold text-faint">
              Amount (USDC)
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                inputMode="decimal"
              />
            </label>
          </div>

          <label className="block text-[12px] font-semibold text-faint">
            Destination type
            <select
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
              value={method}
              onChange={(e) => setMethod(e.target.value as "mobile_money" | "bank")}
            >
              <option value="mobile_money">Mobile money</option>
              <option value="bank">Bank</option>
            </select>
          </label>

          <label className="block text-[12px] font-semibold text-faint">
            Provider
            <select
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
              disabled={loadingCatalog}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.id}
                </option>
              ))}
            </select>
          </label>

          {method === "mobile_money" ? (
            <label className="block text-[12px] font-semibold text-faint">
              Phone (E.164)
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                placeholder="+255…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[12px] font-semibold text-faint">
                Account number
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] mono"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-semibold text-faint">
                Account name
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </label>
            </div>
          )}

          <Button onClick={handleQuote} disabled={busy || loadingCatalog}>
            {busy ? "Working…" : "Get quote"}
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
