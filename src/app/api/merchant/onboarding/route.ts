import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
} from "@/lib/server/aggregator";
import {
  getAggregatorBaseUrl,
  getConsolePartnerApiKey,
} from "@/lib/server/env";
import { ACCESS_COOKIE } from "@/lib/server/cookies";
import type { User } from "@/lib/types";

/**
 * Merchant onboarding BFF: create vault business under EP partner key, then
 * attach pcus_* to the JWT user via /users/me/partner-customer.
 */

async function loadUser(accessToken: string): Promise<User | null> {
  const meRes = await fetchAggregator("/auth/me", { accessToken });
  if (!meRes.ok) return null;
  const json = (await meRes.json()) as User | { data?: User };
  if (json && typeof json === "object" && "data" in json && json.data) {
    return json.data as User;
  }
  return json as User;
}

async function partnerPost(path: string, body: unknown): Promise<Response> {
  const url = `${getAggregatorBaseUrl()}/partner/${path.replace(/^\//, "")}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "X-API-Key": getConsolePartnerApiKey(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function POST(req: NextRequest) {
  const originError = assertTrustedOrigin(req);
  if (originError) return originError;

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let partnerKeyOk = false;
  try {
    getConsolePartnerApiKey();
    partnerKeyOk = true;
  } catch {
    partnerKeyOk = false;
  }
  if (!partnerKeyOk) {
    return NextResponse.json(
      { message: "CONSOLE_PARTNER_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const user = await loadUser(accessToken);
  if (!user || user.role !== "merchant") {
    return NextResponse.json(
      { message: "Merchant onboarding is only for merchant accounts" },
      { status: 403 },
    );
  }
  if (user.partner_customer_id) {
    return NextResponse.json(
      {
        message: "Vault customer already linked",
        data: { partner_customer_id: user.partner_customer_id },
      },
      { status: 200 },
    );
  }

  let body: {
    legal_name?: string;
    country?: string;
    registration_number?: string;
    email?: string;
    phone?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const legal_name = (body.legal_name ?? "").trim();
  const country = (body.country ?? "TZ").trim().toUpperCase();
  const registration_number = (body.registration_number ?? "").trim();
  const email = (body.email ?? user.email ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!legal_name || !registration_number || !email) {
    return NextResponse.json(
      { message: "legal_name, registration_number, and email are required" },
      { status: 400 },
    );
  }

  const ref = `merchant_${user.id}`;
  const createRes = await partnerPost("customers", {
    partner_customer_ref: ref,
    type: "business",
    profile: {
      legal_name,
      country,
      registration_number,
      email,
      ...(phone ? { phone } : {}),
    },
  });
  const createText = await createRes.text();
  let createJson: unknown = null;
  try {
    createJson = createText ? JSON.parse(createText) : null;
  } catch {
    createJson = { message: createText };
  }
  if (!createRes.ok) {
    const message =
      (createJson &&
        typeof createJson === "object" &&
        (createJson as { message?: string }).message) ||
      "Failed to create vault customer";
    return NextResponse.json(
      { message: String(message) },
      { status: createRes.status >= 400 ? createRes.status : 502 },
    );
  }

  const envelope = createJson as { data?: { id?: string; customer_id?: string } };
  const customerId =
    envelope?.data?.id ||
    envelope?.data?.customer_id ||
    (createJson as { id?: string })?.id;
  if (!customerId || typeof customerId !== "string") {
    return NextResponse.json(
      { message: "Customer create succeeded without id", data: createJson },
      { status: 502 },
    );
  }

  const attachRes = await fetchAggregator("/users/me/partner-customer", {
    accessToken,
    method: "POST",
    body: { partner_customer_id: customerId },
  });
  const attachText = await attachRes.text();
  let attachJson: unknown = null;
  try {
    attachJson = attachText ? JSON.parse(attachText) : null;
  } catch {
    attachJson = { message: attachText };
  }
  if (!attachRes.ok) {
    const message =
      (attachJson &&
        typeof attachJson === "object" &&
        (attachJson as { message?: string }).message) ||
      "Failed to link vault customer";
    return NextResponse.json(
      {
        message: String(message),
        data: { customer_id: customerId, attach: attachJson },
      },
      { status: attachRes.status >= 400 ? attachRes.status : 502 },
    );
  }

  return NextResponse.json({
    message: "Merchant onboarding started",
    data: {
      partner_customer_id: customerId,
      status: "incomplete",
      next: "Upload KYB documents in admin or complete docs in a follow-up release, then submit for EP review.",
    },
  });
}
