import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { colors } from "@/lib/theme";
import type { ApiKeyInfo } from "@/lib/types";

function relativeTime(iso: string | null) {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function SettingToggle({
  label,
  checked,
  disabled,
  onChange,
  helper,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  helper?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-0.5 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span className="flex items-center gap-2 text-[12.5px] text-muted">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-ink"
        />
        {label}
      </span>
      {helper && <span className="pl-5 text-[11px] leading-snug text-faint">{helper}</span>}
    </label>
  );
}

export function ApiKeysTable({
  keys,
  busyKeyId,
  onEditWebhook,
  onRevoke,
  onToggleSms,
  onToggleSignedOrders,
}: {
  keys: ApiKeyInfo[];
  busyKeyId?: number | null;
  onEditWebhook: (key: ApiKeyInfo) => void;
  onRevoke: (key: ApiKeyInfo) => void;
  onToggleSms: (key: ApiKeyInfo, next: boolean) => void;
  onToggleSignedOrders: (key: ApiKeyInfo, next: boolean) => void;
}) {
  if (keys.length === 0) {
    return (
      <GlassCard className="px-6 py-10 text-center text-[13px] text-subtle">
        No API keys yet. Create one to start integrating.
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: "oklch(0.98 0.003 264)" }}>
            {["Name", "Key", "Environment", "Last used", "Webhook", "Settings", ""].map((h) => (
              <th key={h || "actions"} className="px-[18px] py-3 text-left text-[11.5px] font-bold text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const envPalette = key.environment === "live" ? colors.success : colors.sandbox;
            const rowBusy = busyKeyId === key.id;
            const togglesDisabled = key.revoked || rowBusy;
            return (
              <tr key={key.id} className={rowBusy ? "opacity-70" : undefined}>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-[13.5px] font-bold">
                  {key.name}
                  {key.revoked && (
                    <span className="ml-2 text-[11px] font-semibold text-[oklch(0.55_0.19_25)]">
                      Revoked
                    </span>
                  )}
                </td>
                <td className="mono border-t border-line-soft px-[18px] py-3.5 text-[12.5px] text-muted">
                  key_{key.id}
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5">
                  <Badge bg={envPalette.bg} color={envPalette.text}>
                    {key.environment === "live" ? "Live" : "Sandbox"}
                  </Badge>
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-[12.5px] text-muted">
                  {relativeTime(key.last_used_at)}
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-[12.5px] text-muted">
                  {key.has_webhook_config ? "Configured" : "Not set"}
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5">
                  <div className="flex flex-col gap-2.5">
                    <SettingToggle
                      label="SMS notifications"
                      checked={key.send_sms_notifications}
                      disabled={togglesDisabled}
                      onChange={(next) => onToggleSms(key, next)}
                    />
                    <SettingToggle
                      label="Signed accepts"
                      checked={key.require_signed_orders}
                      disabled={togglesDisabled}
                      onChange={(next) => onToggleSignedOrders(key, next)}
                      helper="Requires customer EIP-712 signature on accept."
                    />
                  </div>
                </td>
                <td className="border-t border-line-soft px-[18px] py-3.5 text-right whitespace-nowrap">
                  {!key.revoked && (
                    <>
                      <button
                        onClick={() => onEditWebhook(key)}
                        disabled={rowBusy}
                        className="mr-3.5 cursor-pointer text-[12.5px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit webhook
                      </button>
                      <button
                        onClick={() => onRevoke(key)}
                        disabled={rowBusy}
                        className="cursor-pointer text-[12.5px] font-bold text-[oklch(0.55_0.19_25)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </GlassCard>
  );
}
