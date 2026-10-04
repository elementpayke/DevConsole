export function SettingsActivityTab() {
  return (
    <div className="flex max-w-[680px] flex-col gap-2">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>Every settings change on this account.</p>
      <div
        className="rounded-xl p-6 text-center text-[13px]"
        style={{ border: "1px dashed var(--border-strong)", background: "var(--surface-soft)", color: "var(--muted)" }}
      >
        No changes recorded yet. Settings activity will appear here as your team makes changes.
      </div>
    </div>
  );
}
