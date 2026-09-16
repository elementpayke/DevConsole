import { apiFetch } from "./client";
import { withTurnstileToken } from "@/lib/turnstile";
import type { User } from "@/lib/types";

export function login(
  email: string,
  password: string,
  remember = true,
  turnstileToken?: string | null,
) {
  return apiFetch<{ user: User | null }>("/auth/login", {
    method: "POST",
    body: withTurnstileToken({ email, password, remember }, turnstileToken),
    unwrap: false,
    absolutePath: "/api/auth/login",
  });
}

export function register(
  email: string,
  password: string,
  turnstileToken?: string | null,
) {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: withTurnstileToken({ email, password }, turnstileToken),
    unwrap: false,
    absolutePath: "/api/auth/register",
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    unwrap: false,
    absolutePath: "/api/auth/logout",
  });
}

export function getSession() {
  return apiFetch<{ user: User | null }>("/auth/session", {
    unwrap: false,
    absolutePath: "/api/auth/session",
  });
}

export function requestPasswordReset(email: string) {
  return apiFetch<{ message: string }>("/auth/password/reset/request", {
    method: "POST",
    body: { email },
    unwrap: false,
    absolutePath: "/api/auth/password/reset/request",
  });
}

export function confirmPasswordReset(email: string, reset_code: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/password/reset/confirm", {
    method: "POST",
    body: { email, reset_code, new_password },
    unwrap: false,
    absolutePath: "/api/auth/password/reset/confirm",
  });
}

export function changePassword(current_password: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/password/change", {
    method: "POST",
    body: { current_password, new_password },
    unwrap: false,
    absolutePath: "/api/auth/password/change",
  });
}

export function verifyEmail(email: string, verification_code: string) {
  return apiFetch<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: { email, verification_code },
    unwrap: false,
    absolutePath: "/api/auth/verify-email",
  });
}

export function resendVerification(email: string) {
  // Aggregator reuses EmailVerificationSchema for this route (email + code required
  // by the schema) but only uses email. Send a placeholder code.
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email, verification_code: "000000" },
    unwrap: false,
    absolutePath: "/api/auth/resend-verification",
  });
}
