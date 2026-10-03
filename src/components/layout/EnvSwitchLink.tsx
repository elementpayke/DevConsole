"use client";

import { useEnvironment } from "@/lib/env/EnvContext";
import {
  getOppositeConsoleLoginUrl,
  oppositeEnvironmentLabel,
} from "@/lib/consoleUrls";
import { colors } from "@/lib/theme";

/**
 * Cross-deploy jump: sandbox → live login URL, live → sandbox login URL.
 * Hidden when the opposite NEXT_PUBLIC_*_CONSOLE_URL is unset.
 */
export function EnvSwitchLink({ className }: { className?: string }) {
  const { environment } = useEnvironment();
  const href = getOppositeConsoleLoginUrl(environment);
  if (!href) return null;

  const targetLabel = oppositeEnvironmentLabel(environment);
  const palette = environment === "sandbox" ? colors.live : colors.sandbox;

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px] font-extrabold tracking-wide no-underline uppercase ${className ?? ""}`}
      style={{
        background: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
    >
      Log in to {targetLabel}
    </a>
  );
}
