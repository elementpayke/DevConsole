import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { colors } from "@/lib/theme";
import type { TokenMeta } from "@/lib/types";

export function TokensTable({ tokens }: { tokens: TokenMeta[] }) {
  return (
    <GlassCard className="mb-6 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: "oklch(0.98 0.003 264)" }}>
            {["Token", "Network", "Chain ID", "Contract", "Status"].map((h) => (
              <th key={h} className="px-[18px] py-3 text-left text-[11.5px] font-bold text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, i) => (
            <tr key={`${t.symbol}-${t.chain_id}-${i}`}>
              <td className="border-t border-line-soft px-[18px] py-3.5 text-[13px] font-bold">
                {t.symbol}
              </td>
              <td className="border-t border-line-soft px-[18px] py-3.5 text-[13px]">
                {t.chain_name}
              </td>
              <td className="mono border-t border-line-soft px-[18px] py-3.5 text-[12.5px] text-muted">
                {t.chain_id}
              </td>
              <td className="mono border-t border-line-soft px-[18px] py-3.5 text-xs text-muted">
                {t.address.slice(0, 6)}…{t.address.slice(-4)}
              </td>
              <td className="border-t border-line-soft px-[18px] py-3.5">
                <Badge bg={colors.success.bg} color={colors.success.text}>
                  Active
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tokens.length === 0 && (
        <div className="p-10 text-center text-[13px] text-subtle">No tokens for this environment.</div>
      )}
    </GlassCard>
  );
}
