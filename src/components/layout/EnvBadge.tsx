"use client";

import { colors } from "@/lib/theme";
import { useEnvironment } from "@/lib/env/EnvContext";
import { useColorMode } from "@/lib/theme/ThemeContext";

/** Sandbox/Live badge from NEXT_PUBLIC_ENVIRONMENT (per-deployment). Defaults to the active color mode. */
export function EnvBadge({ dark }: { dark?: boolean }) {
  const { environment } = useEnvironment();
  const { mode } = useColorMode();
  const isDark = dark ?? mode === "dark";
  const palette = environment === "sandbox" ? colors.sandbox : colors.live;
  const label = environment === "sandbox" ? "Sandbox mode" : "Live mode";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-[11.5px] font-extrabold tracking-wide uppercase"
      style={{
        background: isDark ? palette.darkBg : palette.bg,
        color: isDark ? palette.darkText : palette.text,
        borderColor: isDark ? palette.darkBorder : palette.border,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: isDark ? palette.darkDot : palette.dot }}
      />
      {label}
    </span>
  );
}
