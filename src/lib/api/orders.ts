import { apiFetch } from "./client";
import type { Order } from "@/lib/types";

export type OrderTypeQuery = "onramp" | "offramp";

export function listMyOrders(filters?: {
  status_filter?: string;
  order_type?: OrderTypeQuery;
}) {
  return apiFetch<Order[]>("/orders/me", { query: filters });
}
