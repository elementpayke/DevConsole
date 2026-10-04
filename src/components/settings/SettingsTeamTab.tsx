"use client";

import { useState } from "react";

type Member = { id: string; name: string; email: string; role: string };

const SEED_MEMBERS: Member[] = [];

const ROLE_MATRIX = [
  { role: "Admin", can: "Everything, including inviting and removing teammates." },
  { role: "Finance", can: "View money movement, send payouts, manage payout destinations." },
  { role: "Developer", can: "Manage API keys, webhooks and the checkout integration." },
  { role: "Viewer", can: "Read-only access to transactions and dashboards." },
];

export function SettingsTeamTab() {
  const [members] = useState<Member[]>(SEED_MEMBERS);
  const [invites, setInvites] = useState<{ email: string; role: string }[]>([]);
  const [invite, setInvite] = useState("");
  const [role, setRole] = useState("Developer");

  function sendInvite() {
    if (!invite.trim()) return;
    setInvites((prev) => [...prev, { email: invite.trim(), role }]);
    setInvite("");
  }

  return (
    <div className="flex max-w-[680px] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="teammate@company.com"
          className="min-w-[200px] flex-1 rounded-lg px-3 py-2.5 text-[13px]"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-[13px]"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)" }}
        >
          <option>Developer</option>
          <option>Admin</option>
          <option>Finance</option>
          <option>Viewer</option>
        </select>
        <button
          type="button"
          onClick={sendInvite}
          className="rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold"
          style={{ background: "var(--indigo)", color: "var(--on-indigo)" }}
        >
          Send invite
        </button>
      </div>

      {members.length === 0 && invites.length === 0 ? (
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>
          It&apos;s just you so far. Invite teammates to share access to this account.
        </p>
      ) : (
        <div className="flex flex-col">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="text-[13px] font-bold">{m.name}</span>
              <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>{m.email}</span>
              <span className="ml-auto text-[11.5px] font-bold" style={{ color: "var(--indigo-text)" }}>{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {invites.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-bold">Pending invites</span>
          {invites.map((i) => (
            <div
              key={i.email}
              className="flex flex-wrap items-center gap-2.5 rounded-lg p-2.5"
              style={{ border: "1px solid var(--line)" }}
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{i.email}</span>
              <span className="text-[11.5px] font-bold" style={{ color: "var(--indigo-text)" }}>{i.role}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
        <span className="text-[12.5px] font-bold">What each role can do</span>
        {ROLE_MATRIX.map((r) => (
          <div key={r.role} className="grid grid-cols-[86px_1fr] items-baseline gap-3">
            <span className="text-[12.5px] font-bold" style={{ color: "var(--indigo-text)" }}>{r.role}</span>
            <span className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{r.can}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
