import { ApiError } from "@/lib/api/client";

const OFFRAMP_PREFIX = "/api/offramp";

async function offrampFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    query?: Record<string, string | number | undefined | null>;
  } = {},
): Promise<T> {
  const { method = "GET", body, query } = options;
  const url = new URL(
    `${OFFRAMP_PREFIX}/${path.replace(/^\//, "")}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${url.pathname}${url.search}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Off-ramp request failed — server may be down.", 0);
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      (json &&
        typeof json === "object" &&
        ((json as { message?: string }).message ||
          (json as { detail?: string }).detail)) ??
      `Request failed with status ${res.status}`;
    throw new ApiError(String(message), res.status, json);
  }

  const envelope = json as { status?: string; data?: T };
  if (envelope && typeof envelope === "object" && "data" in envelope) {
    return envelope.data as T;
  }
  return json as T;
}

export type CatalogProvider = {
  id: string;
  name?: string;
  [key: string]: unknown;
};

export type OfframpQuoteRequest = {
  order_type?: "OffRamp";
  currency: string;
  country: string;
  crypto_amount: number;
  asset: {
    token: string;
    currency: string;
    network: string;
  };
  payment_method: {
    type: "mobile_money" | "bank";
    phone_number?: string;
    network_id: string;
    account_number?: string;
    account_name?: string;
  };
  refund_address: string;
};

export type OfframpQuote = {
  quote_id: string;
  expires_at?: string;
  amounts?: {
    rate?: number;
    user_pays?: { amount?: number; currency?: string };
    user_receives?: { amount?: number; currency?: string; network?: string };
    fees?: Record<string, number>;
  };
  [key: string]: unknown;
};

export async function getOfframpCatalog(country?: string) {
  return offrampFetch<unknown>("catalog", {
    query: {
      order_type: "OffRamp",
      country: country || undefined,
    },
  });
}

export async function createOfframpQuote(body: OfframpQuoteRequest) {
  return offrampFetch<OfframpQuote>("orders/quote", {
    method: "POST",
    body: { ...body, order_type: "OffRamp" },
  });
}

export async function acceptOfframpQuote(quoteId: string) {
  return offrampFetch<unknown>(`orders/${encodeURIComponent(quoteId)}/accept`, {
    method: "POST",
    body: {},
  });
}

export async function getOfframpOrder(orderId: string) {
  return offrampFetch<unknown>(`orders/${encodeURIComponent(orderId)}`);
}
