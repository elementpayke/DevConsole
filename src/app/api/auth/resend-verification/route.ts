import { NextRequest } from "next/server";
import { proxyAuthPostHandler } from "@/lib/server/auth-proxy";

export async function POST(req: NextRequest) {
  return proxyAuthPostHandler(req, "/auth/resend-verification");
}
