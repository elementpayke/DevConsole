import { apiFetch } from "./client";
import type { DashboardStats } from "@/lib/types";

export function getDashboardStats(token: string) {
  return apiFetch<DashboardStats>("/users/me/dashboard", { token });
}
