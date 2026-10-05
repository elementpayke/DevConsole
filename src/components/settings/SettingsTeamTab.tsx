export function SettingsTeamTab() {
  return (
    <div className="flex max-w-[680px] flex-col gap-3">
      <h2 className="m-0 text-[15px] font-bold">Team</h2>
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Invite teammates with roles once organization membership ships on the aggregator.
      </p>
      <div
        className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Coming soon — invites are not sent from this screen.
      </div>
    </div>
  );
}
