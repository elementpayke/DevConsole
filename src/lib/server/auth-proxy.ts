import { NextRequest, NextResponse } from "next/server";
import {
  assertTrustedOrigin,
  fetchAggregator,
  misconfiguredSecretResponse,
  nextResponseFromUpstream,
} from "@/lib/server/aggregator";

async function proxyAuthPost(req: NextRequest, aggregatorPath: string) {
  const originBlock = assertTrustedOrigin(req);
  if (originBlock) return originBlock;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetchAggregator(aggregatorPath, { method: "POST", body });
    return nextResponseFromUpstream(upstream);
  } catch (err) {
    if (err instanceof Error && err.message.includes("FE_CLIENT_SECRET")) {
      return misconfiguredSecretResponse();
    }
    return NextResponse.json({ message: "Aggregator unreachable" }, { status: 502 });
  }
}

export const proxyAuthPostHandler = proxyAuthPost;
