/**
 * Color tokens that don't map cleanly onto reusable Tailwind utilities
 * (status badges, method colors, env badges) — ported directly from the
 * ElementPay Redesign mockup's inline oklch values.
 */

export const colors = {
  ink: "oklch(0.19 0.02 264)",
  muted: "oklch(0.48 0.015 264)",
  subtle: "oklch(0.5 0.012 264)",
  faint: "oklch(0.55 0.012 264)",
  line: "oklch(0.91 0.006 264)",
  lineStrong: "oklch(0.88 0.006 264)",
  primary: "#4133d7",
  primaryHover: "#352ab0",
  primaryTint: "#f0effc",

  sandbox: {
    bg: "oklch(0.94 0.04 240)",
    text: "oklch(0.4 0.16 240)",
    border: "oklch(0.8 0.07 240)",
    dot: "oklch(0.55 0.16 240)",
    headerTint: "oklch(0.96 0.015 240 / 0.55)",
    borderTint: "oklch(0.85 0.04 240 / 0.6)",
    darkBg: "oklch(0.32 0.06 240 / 0.5)",
    darkText: "oklch(0.85 0.06 240)",
    darkBorder: "oklch(0.5 0.08 240 / 0.6)",
    darkDot: "oklch(0.75 0.14 240)",
  },
  live: {
    bg: "oklch(0.94 0.06 152)",
    text: "oklch(0.38 0.16 152)",
    border: "oklch(0.78 0.09 152)",
    dot: "oklch(0.55 0.18 152)",
    headerTint: "oklch(0.96 0.02 152 / 0.5)",
    borderTint: "oklch(0.85 0.05 152 / 0.6)",
    darkBg: "oklch(0.32 0.07 152 / 0.5)",
    darkText: "oklch(0.85 0.09 152)",
    darkBorder: "oklch(0.5 0.1 152 / 0.6)",
    darkDot: "oklch(0.75 0.17 152)",
  },

  success: { bg: "oklch(0.94 0.05 152)", text: "oklch(0.4 0.14 152)" },
  warning: { bg: "oklch(0.96 0.06 80)", text: "oklch(0.5 0.13 80)" },
  danger: { bg: "oklch(0.96 0.04 25)", text: "oklch(0.55 0.17 25)" },
  operational: "oklch(0.6 0.14 152)",

  methodGet: "oklch(0.5 0.14 152)",
  methodPost: "#352ab0",
  methodOther: "oklch(0.5 0.012 264)",
} as const;

export const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  settled: colors.success,
  completed: colors.success,
  settled_unverified: colors.success,
  pending: colors.warning,
  processing: colors.warning,
  failed: colors.danger,
  refunded: colors.danger,
};

export function statusStyle(status: string) {
  return STATUS_STYLE[status.toLowerCase()] ?? {
    bg: "oklch(0.95 0.004 264)",
    text: colors.faint,
  };
}

export function growthStyle(growth: number) {
  if (growth > 0) return { color: "oklch(0.5 0.14 152)", label: `+${growth.toFixed(1)}%` };
  if (growth < 0) return { color: "oklch(0.55 0.19 25)", label: `${growth.toFixed(1)}%` };
  return { color: colors.faint, label: "—" };
}
