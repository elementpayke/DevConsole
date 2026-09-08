import { apiFetch } from "./client";
import type { DashboardStats } from "@/lib/types";

export function getDashboardStats() {
  return apiFetch<DashboardStats>("/users/me/dashboard");
}
