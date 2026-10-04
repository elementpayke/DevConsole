import { colors } from "@/lib/theme";
import { EnvBadge } from "./EnvBadge";
import { EnvSwitchLink } from "./EnvSwitchLink";
import { useEnvironment } from "@/lib/env/EnvContext";
import { useColorMode } from "@/lib/theme/ThemeContext";
import { useRail } from "@/lib/layout/RailContext";

export function Header({
  title,
  showOperational = false,
  showEnvBadge = true,
  action,
}: {
  title: string;
  showOperational?: boolean;
  showEnvBadge?: boolean;
  action?: React.ReactNode;
}) {
  const { environment } = useEnvironment();
  const { mode, toggleMode } = useColorMode();
  const { openMobile } = useRail();
  const tint = environment === "sandbox" ? colors.sandbox : colors.live;

  return (
    <header
      className="sticky top-0 z-[1] flex h-16 items-center gap-3 px-4 backdrop-blur-xl md:px-7"
      style={{
        borderBottom: `1px solid ${tint.borderTint}`,
        background: tint.headerTint,
      }}
    >
      <button
        type="button"
        onClick={openMobile}
        aria-label="Open menu"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg md:hidden"
        style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 truncate text-[15px] font-bold md:flex-none">{title}</span>
      <div className="ml-auto flex items-center gap-2 md:gap-2.5">
        {showOperational && (
          <div className="hidden items-center gap-1.5 text-[12.5px] font-semibold text-muted lg:flex">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors.operational }} />
            All systems operational
          </div>
        )}
        <button
          type="button"
          onClick={toggleMode}
          title="Toggle dark mode"
          className="rounded-lg px-2.5 py-2 text-[12.5px] font-semibold"
          style={{ color: "var(--muted)" }}
        >
          {mode === "light" ? "Dark" : "Light"}
        </button>
        <a
          href="https://docs.elementpay.net"
          target="_blank"
          rel="noopener"
          className="hidden rounded-lg px-2.5 py-2 text-[12.5px] font-semibold no-underline sm:inline-block"
          style={{ color: "var(--muted)" }}
        >
          Docs
        </a>
        {showEnvBadge && (
          <>
            <EnvBadge />
            <EnvSwitchLink />
          </>
        )}
        {action}
      </div>
    </header>
  );
}
