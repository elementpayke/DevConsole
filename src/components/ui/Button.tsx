import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-primary text-[color:var(--on-indigo)] hover:bg-primary-hover border border-[color:var(--indigo)]",
  secondary: "bg-transparent text-ink border border-line-strong hover:bg-surface",
  danger: "bg-transparent text-[oklch(0.55_0.19_25)] border border-line-strong hover:bg-surface",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`cursor-pointer rounded-[var(--radius-md)] px-4 py-2.5 text-[13.5px] font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
      style={{ fontFamily: "var(--font-heading)" }}
      {...props}
    />
  );
}
