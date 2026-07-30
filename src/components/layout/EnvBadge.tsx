"use client";

import { colors } from "@/lib/theme";
import { useEnvironment } from "@/lib/env/EnvContext";

/** Sandbox/Live indicator. Display-only: the aggregator API doesn't scope
 * dashboard/order queries by environment, so this reflects each API key's
 * own `environment` field rather than switching backends. */
export function EnvBadge({ dark = false }: { dark?: boolean }) {
  const { environment } = useEnvironment();
  const palette = environment === "sandbox" ? colors.sandbox : colors.live;
  const label = environment === "sandbox" ? "Sandbox mode" : "Live mode";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-[11.5px] font-extrabold tracking-wide uppercase"
      style={{
        background: dark ? palette.darkBg : palette.bg,
        color: dark ? palette.darkText : palette.text,
        borderColor: dark ? palette.darkBorder : palette.border,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: dark ? palette.darkDot : palette.dot }}
      />
      {label}
    </span>
  );
}
