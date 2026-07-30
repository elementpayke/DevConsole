import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { colors } from "@/lib/theme";

const ACTIONS = [
  { href: "/api-keys", title: "Manage API keys", desc: "Create and rotate integration keys" },
  { href: "/transactions", title: "View transactions", desc: "Track order status and settlement" },
];

export function QuickActions() {
  return (
    <GlassCard className="p-5">
      <div className="mb-3.5 text-[14.5px] font-bold">Quick actions</div>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3.5 rounded-lg border border-line px-[18px] py-4"
          >
            <div
              className="h-9 w-9 flex-shrink-0 rounded-lg"
              style={{ background: colors.primaryTint }}
            />
            <div>
              <div className="text-[13.5px] font-bold">{action.title}</div>
              <div className="text-xs text-subtle">{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
