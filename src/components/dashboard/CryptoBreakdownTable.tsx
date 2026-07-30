import { GlassCard } from "@/components/ui/GlassCard";
import type { CurrencyStats } from "@/lib/types";
import { growthStyle } from "@/lib/theme";

export function CryptoBreakdownTable({ breakdown }: { breakdown: Record<string, CurrencyStats> }) {
  const entries = Object.entries(breakdown);

  return (
    <GlassCard className="p-5">
      <div className="mb-0.5 text-[14.5px] font-bold">Crypto token breakdown</div>
      <div className="mb-3.5 text-[12.5px] text-subtle">Conversion volume by token</div>

      {entries.length === 0 ? (
        <p className="text-[13px] text-subtle">No crypto activity yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-line-soft py-1.5 text-left text-[11.5px] font-semibold text-faint">
                Token
              </th>
              <th className="border-b border-line-soft py-1.5 text-right text-[11.5px] font-semibold text-faint">
                Volume
              </th>
              <th className="border-b border-line-soft py-1.5 text-right text-[11.5px] font-semibold text-faint">
                Settled
              </th>
              <th className="border-b border-line-soft py-1.5 text-right text-[11.5px] font-semibold text-faint">
                Txns
              </th>
              <th className="border-b border-line-soft py-1.5 text-right text-[11.5px] font-semibold text-faint">
                7d
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([token, stats]) => {
              const growth = growthStyle(stats.weekly_growth);
              return (
                <tr key={token}>
                  <td className="border-b border-line-soft py-2.5 text-[13px] font-bold">{token}</td>
                  <td className="mono border-b border-line-soft py-2.5 text-right text-[12.5px]">
                    {stats.total_volume.toLocaleString()}
                  </td>
                  <td className="mono border-b border-line-soft py-2.5 text-right text-[12.5px] text-muted">
                    {stats.settled_amount.toLocaleString()}
                  </td>
                  <td className="mono border-b border-line-soft py-2.5 text-right text-[12.5px]">
                    {stats.transaction_count}
                  </td>
                  <td
                    className="mono border-b border-line-soft py-2.5 text-right text-[12.5px]"
                    style={{ color: growth.color }}
                  >
                    {growth.label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </GlassCard>
  );
}
