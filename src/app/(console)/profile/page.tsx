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
import { MerchantPaymentAccountCard } from "@/components/merchant/MerchantPaymentAccountCard";
import { useMerchantExperience } from "@/lib/auth/useMerchantExperience";
import { SettingsMethodsTab } from "@/components/settings/SettingsMethodsTab";
import { SettingsTeamTab } from "@/components/settings/SettingsTeamTab";
import { SettingsAlertsTab } from "@/components/settings/SettingsAlertsTab";
import { SettingsComplianceTab } from "@/components/settings/SettingsComplianceTab";
import { SettingsActivityTab } from "@/components/settings/SettingsActivityTab";
import { CollectProfileCard } from "@/components/settings/CollectProfileCard";

const TABS = [
  { id: "identity", label: "Identity" },
  { id: "money", label: "Money" },
  { id: "methods", label: "Methods" },
  { id: "team", label: "Team" },
  { id: "alerts", label: "Alerts" },
  { id: "compliance", label: "Compliance" },
  { id: "activity", label: "Activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isMerchant } = useMerchantExperience();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("identity");

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
      <Header title="Settings" showEnvBadge={false} />
      <div className="max-w-[780px] p-5 md:p-7">
        <section
          className="mb-5 flex flex-wrap items-center gap-4 rounded-xl p-4"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
            style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
          >
            {initial}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[14.5px] font-bold">{user?.email}</span>
            <span className="truncate text-[12px]" style={{ color: "var(--muted)" }}>
              {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "—"}
            </span>
          </span>
          <span className="ml-auto">
            {user?.kyc_verified ? (
              <Badge bg={colors.success.bg} color={colors.success.text}>KYC verified</Badge>
            ) : (
              <Badge bg={colors.warning.bg} color={colors.warning.text}>KYC pending</Badge>
            )}
          </span>
        </section>

        <div className="mb-5 flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--border-strong)" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="rounded-t-lg px-3.5 py-2.5 text-[13px] font-semibold"
                style={{
                  color: active ? "var(--indigo-text)" : "var(--muted)",
                  borderBottom: active ? "2px solid var(--indigo)" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "identity" && (
          <div className="flex flex-col gap-5">
            <CollectProfileCard />

            <GlassCard className="p-[22px]">
              <div className="mb-4 text-[14.5px] font-bold">Account details</div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">Email</div>
                  <div className="text-[13px]">{user?.email}</div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">Member since</div>
                  <div className="text-[13px]">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-[22px]">
              <div className="mb-0.5 text-[14.5px] font-bold">Reset password</div>
              <div className="mb-[18px] text-[12.5px] text-subtle">
                You&apos;ll stay logged in on this device after resetting.
              </div>
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3.5">
                <div>
                  <label htmlFor="current-password" className="mb-1.5 block text-xs font-bold">Current password</label>
                  <PasswordInput id="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold">New password</label>
                    <PasswordInput id="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-bold">Confirm new password</label>
                    <PasswordInput id="confirm-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                  </div>
                </div>
                {error && <p className="text-[12.5px] font-medium" style={{ color: "var(--bad-text)" }}>{error}</p>}
                {success && <p className="text-[12.5px] font-medium" style={{ color: colors.success.text }}>Password updated.</p>}
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
              <Button variant="danger" onClick={handleSignOut}>Sign out</Button>
            </GlassCard>
          </div>
        )}

        {tab === "money" && (
          <div className="flex flex-col gap-5">
            {isMerchant ? (
              <MerchantPaymentAccountCard />
            ) : (
              <GlassCard className="p-[22px] text-[13px]" style={{ color: "var(--muted)" }}>
                Payout routing applies to merchant accounts. Developer accounts settle via the API&apos;s
                fiat_payload on each order.
              </GlassCard>
            )}
          </div>
        )}

        {tab === "methods" && <SettingsMethodsTab />}
        {tab === "team" && <SettingsTeamTab />}
        {tab === "alerts" && <SettingsAlertsTab />}
        {tab === "compliance" && <SettingsComplianceTab />}
        {tab === "activity" && <SettingsActivityTab />}
      </div>
    </>
  );
}
