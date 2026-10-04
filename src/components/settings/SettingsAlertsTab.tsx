export function SettingsAlertsTab() {
  return (
    <div className="flex max-w-[620px] flex-col gap-3">
      <h2 className="m-0 text-[15px] font-bold">Alerts</h2>
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Email and Slack destinations for failed payments, payouts, and verification updates.
      </p>
      <div
        className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Coming soon — destinations are not saved and do not configure operational alerts.
      </div>
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Webhook delivery for API integrations is configured under API Keys today.
      </p>
    </div>
  );
}
