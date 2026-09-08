import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";
import { readAccessToken } from "@/lib/server/cookies";

export async function POST(req: NextRequest) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  const access = await readAccessToken();
  if (!access) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetchAggregator("/auth/password/change", {
      method: "POST",
      body,
      accessToken: access,
    });
    return nextResponseFromUpstream(upstream);
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}
