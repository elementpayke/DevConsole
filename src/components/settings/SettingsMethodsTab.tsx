export function SettingsMethodsTab() {
  return (
    <ComingSoonSettings
      title="Payment methods"
      body="Choose which rails customers see at checkout. Prefs will sync to your collect profile when that API is ready."
    />
  );
}

function ComingSoonSettings({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex max-w-[620px] flex-col gap-3">
      <h2 className="m-0 text-[15px] font-bold">{title}</h2>
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        {body}
      </p>
      <div
        className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Coming soon — toggles are not saved and do not change live checkout.
      </div>
    </div>
  );
}
