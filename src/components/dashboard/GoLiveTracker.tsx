import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { colors } from "@/lib/theme";

type Step = {
  label: string;
  sub: string;
  state: "done" | "active" | "pending";
};

function StepCircle({ state, index }: { state: Step["state"]; index: number }) {
  if (state === "done") {
    return (
      <div
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-extrabold"
        style={{ background: colors.success.bg, color: colors.success.text }}
      >
        ✓
      </div>
    );
  }
  if (state === "active") {
    return (
      <div
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-xs font-extrabold"
        style={{ borderColor: colors.primary, color: colors.primaryHover }}
      >
        {index + 1}
      </div>
    );
  }
  return (
    <div
      className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-xs font-extrabold text-faint"
      style={{ borderColor: colors.lineStrong }}
    >
      {index + 1}
    </div>
  );
}

export function GoLiveTracker({ steps }: { steps: Step[] }) {
  const completed = steps.filter((s) => s.state === "done").length;

  return (
    <GlassCard className="mb-6 p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[14.5px] font-bold">Go live</div>
        <span
          className="rounded-md px-2.5 py-1 text-[11.5px] font-bold"
          style={{ background: colors.warning.bg, color: colors.warning.text }}
        >
          Step {Math.min(completed + 1, steps.length)} of {steps.length}
        </span>
      </div>
      <div className="mb-[18px] text-[12.5px] text-subtle">
        A guided path from your first sandbox key to a confirmed live transaction.
      </div>

      <div className="mb-[18px] flex items-start">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-1 items-start">
            <div className="flex w-[120px] flex-shrink-0 flex-col items-center">
              <StepCircle state={step.state} index={i} />
              <div className="mt-2 text-center text-[11.5px] font-bold">{step.label}</div>
              <div className="mt-0.5 text-center text-[10.5px] text-faint">{step.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mt-[13px] h-0.5 flex-1"
                style={{
                  background: step.state === "done" ? colors.success.text : colors.lineStrong,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="text-[12.5px] text-muted">
          Next: complete a sandbox off-ramp order to move toward your live-key request.
        </div>
        <Link href="/transactions">
          <Button>Run sandbox order →</Button>
        </Link>
      </div>
    </GlassCard>
  );
}
