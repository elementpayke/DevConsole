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
  info,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  info?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${disabled ? "opacity-50" : ""}`}>
      <label
        className={`flex items-center gap-2 text-[12.5px] text-muted ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-ink"
        />
        {label}
      </label>
      {info && (
        <span className="group relative inline-flex">
          <button
            type="button"
            aria-label={info}
            className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-line-soft text-[9px] font-bold leading-none text-faint"
          >
            i
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-line-soft bg-white px-2 py-1.5 text-left text-[11px] leading-snug text-muted opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {info}
          </span>
        </span>
      )}
    </div>
  );
}

export function ApiKeysTable({
  keys,
  busyKeyIds,
  onEditWebhook,
  onRevoke,
  onToggleSms,
  onToggleSignedOrders,
}: {
  keys: ApiKeyInfo[];
  busyKeyIds?: ReadonlySet<number>;
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
            const rowBusy = busyKeyIds?.has(key.id) ?? false;
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
                  <div className="flex flex-col gap-1.5">
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
                      info="Requires customer EIP-712 signature on accept."
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
