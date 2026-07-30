import { colors } from "@/lib/theme";
import { EnvBadge } from "./EnvBadge";
import { useEnvironment } from "@/lib/env/EnvContext";

export function Header({
  title,
  showOperational = false,
  showEnvBadge = true,
}: {
  title: string;
  showOperational?: boolean;
  showEnvBadge?: boolean;
}) {
  const { environment } = useEnvironment();
  const tint = environment === "sandbox" ? colors.sandbox : colors.live;

  return (
    <header
      className="sticky top-0 z-[1] flex h-16 items-center justify-between px-7 backdrop-blur-xl"
      style={{
        borderBottom: `1px solid ${tint.borderTint}`,
        background: tint.headerTint,
      }}
    >
      <span className="text-[15px] font-bold">{title}</span>
      <div className="flex items-center gap-2.5">
        {showOperational && (
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors.operational }} />
            All systems operational
          </div>
        )}
        {showEnvBadge && <EnvBadge />}
      </div>
    </header>
  );
}
