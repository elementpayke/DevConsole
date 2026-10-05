export function SettingsActivityTab() {
  return (
    <div className="flex max-w-[680px] flex-col gap-2">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
        Settings activity will appear here once an activity feed is available.
      </p>
      <div
        className="rounded-xl p-6 text-center text-[13px]"
        style={{ border: "1px dashed var(--border-strong)", background: "var(--surface-soft)", color: "var(--muted)" }}
      >
        Activity history is not available yet — this tab is a layout preview.
      </div>
    </div>
  );
}
