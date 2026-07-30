"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">Log in</h1>
      <p className="mb-7 text-[13.5px] text-muted">Welcome back. Manage your integration below.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Email</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2.5">
            <span className="text-[12.5px] font-bold whitespace-nowrap">Password</span>
            <Link
              href="/forgot-password"
              className="text-[12.5px] font-semibold whitespace-nowrap text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full py-3.5 text-[14.5px]">
          {loading ? "Logging in…" : "Log in →"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted">
        No account yet?{" "}
        <Link href="/register" className="font-bold text-primary hover:text-primary-hover">
          Create one
        </Link>
      </p>
    </div>
  );
}
