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

export function ApiKeysTable({
  keys,
  onEditWebhook,
  onRevoke,
}: {
  keys: ApiKeyInfo[];
  onEditWebhook: (key: ApiKeyInfo) => void;
  onRevoke: (key: ApiKeyInfo) => void;
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
            {["Name", "Key", "Environment", "Last used", "Webhook", ""].map((h) => (
              <th key={h} className="px-[18px] py-3 text-left text-[11.5px] font-bold text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const envPalette = key.environment === "live" ? colors.success : colors.sandbox;
            return (
              <tr key={key.id}>
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
                <td className="border-t border-line-soft px-[18px] py-3.5 text-right whitespace-nowrap">
                  {!key.revoked && (
                    <>
                      <button
                        onClick={() => onEditWebhook(key)}
                        className="mr-3.5 cursor-pointer text-[12.5px] font-bold text-ink"
                      >
                        Edit webhook
                      </button>
                      <button
                        onClick={() => onRevoke(key)}
                        className="cursor-pointer text-[12.5px] font-bold text-[oklch(0.55_0.19_25)]"
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
