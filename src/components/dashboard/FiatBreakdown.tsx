import { GlassCard } from "@/components/ui/GlassCard";
import type { CurrencyStats } from "@/lib/types";
import { colors } from "@/lib/theme";

export function FiatBreakdown({ breakdown }: { breakdown: Record<string, CurrencyStats> }) {
  const entries = Object.entries(breakdown);

  return (
    <GlassCard className="p-5">
      <div className="mb-0.5 text-[14.5px] font-bold">Fiat breakdown</div>
      <div className="mb-[18px] text-[12.5px] text-subtle">Cash disbursement statistics</div>

      {entries.length === 0 && (
        <p className="text-[13px] text-subtle">No fiat activity yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {entries.map(([currency, stats]) => (
          <div key={currency}>
            <div className="mb-3.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: colors.warning.text }} />
              <span className="text-[13.5px] font-bold">{currency}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-0.5 text-[11.5px] text-faint">Total volume</div>
                <div className="mono text-sm font-bold">{stats.total_volume.toLocaleString()}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11.5px] text-faint">Settled</div>
                <div className="mono text-sm font-bold">{stats.settled_amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11.5px] text-faint">Orders</div>
                <div className="mono text-sm font-bold">{stats.transaction_count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
