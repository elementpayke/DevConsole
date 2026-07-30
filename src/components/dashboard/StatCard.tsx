import { GlassCard } from "@/components/ui/GlassCard";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <GlassCard className="px-[18px] py-4">
      <div className="mb-2 text-xs font-semibold text-subtle">{label}</div>
      <div className="mono text-[23px] font-extrabold">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-subtle">{hint}</div>}
    </GlassCard>
  );
}
