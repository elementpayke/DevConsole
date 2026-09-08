"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/lib/auth/AuthContext";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { colors } from "@/lib/theme";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = (user?.email?.[0] ?? "?").toUpperCase();

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      <Header title="Profile & account" showEnvBadge={false} />
      <div className="max-w-[640px] p-7">
        <GlassCard className="mb-5 p-[22px]">
          <div className="mb-4 text-[14.5px] font-bold">Account details</div>
          <div className="mb-5 flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
              style={{ background: colors.primaryTint, color: colors.primaryHover }}
            >
              {initial}
            </div>
            <div>
              <div className="text-[14.5px] font-bold">{user?.email}</div>
              <div className="flex items-center gap-2 text-[12.5px] text-subtle">
                {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "—"}
                {user?.kyc_verified ? (
                  <Badge bg={colors.success.bg} color={colors.success.text}>
                    KYC verified
                  </Badge>
                ) : (
                  <Badge bg={colors.warning.bg} color={colors.warning.text}>
                    KYC pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">
                Email
              </div>
              <div className="text-[13px]">{user?.email}</div>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">
                Member since
              </div>
              <div className="text-[13px]">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mb-5 p-[22px]">
          <div className="mb-0.5 text-[14.5px] font-bold">Reset password</div>
          <div className="mb-[18px] text-[12.5px] text-subtle">
            You&apos;ll stay logged in on this device after resetting.
          </div>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3.5">
            <div>
              <div className="mb-1.5 text-xs font-bold">Current password</div>
              <PasswordInput
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="mb-1.5 text-xs font-bold">New password</div>
                <PasswordInput
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-bold">Confirm new password</div>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                />
              </div>
            </div>
            {error && <p className="text-[12.5px] font-medium text-[oklch(0.55_0.19_25)]">{error}</p>}
            {success && (
              <p className="text-[12.5px] font-medium" style={{ color: colors.success.text }}>
                Password updated.
              </p>
            )}
            <Button type="submit" disabled={loading} className="w-fit">
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </GlassCard>

        <GlassCard className="flex items-center justify-between p-[22px]">
          <div>
            <div className="mb-0.5 text-[14.5px] font-bold">Sign out</div>
            <div className="text-[12.5px] text-subtle">End your session on this device.</div>
          </div>
          <Button variant="danger" onClick={handleSignOut}>
            Sign out
          </Button>
        </GlassCard>
      </div>
    </>
  );
}
