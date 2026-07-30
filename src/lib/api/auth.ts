import { apiFetch } from "./client";
import type { AuthTokens, User } from "@/lib/types";

export function login(email: string, password: string) {
  return apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: { email, password },
    unwrap: false,
  });
}

export function register(email: string, password: string) {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: { email, password },
    unwrap: false,
  });
}

export function refreshToken(refresh_token: string) {
  return apiFetch<AuthTokens>("/auth/token/refresh", {
    method: "POST",
    body: { refresh_token },
    unwrap: false,
  });
}

export function getMe(token: string) {
  return apiFetch<User>("/auth/me", { token, unwrap: false });
}

export function requestPasswordReset(email: string) {
  return apiFetch<{ message: string }>("/auth/password/reset/request", {
    method: "POST",
    body: { email },
    unwrap: false,
  });
}

export function confirmPasswordReset(email: string, reset_code: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/password/reset/confirm", {
    method: "POST",
    body: { email, reset_code, new_password },
    unwrap: false,
  });
}

export function changePassword(token: string, current_password: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/password/change", {
    method: "POST",
    body: { current_password, new_password },
    token,
    unwrap: false,
  });
}
