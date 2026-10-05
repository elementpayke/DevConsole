type ComingSoonPanelProps = {
  title: string;
  description: string;
};

/** Honest placeholder for collect surfaces that are not API-backed yet. */
export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <section
      className="flex flex-col gap-3 rounded-xl p-5"
      style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
    >
      <span className="text-[16px] font-bold">{title}</span>
      <p className="m-0 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {description}
      </p>
      <div
        className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
      >
        Coming soon — nothing here creates live payment links or contacts customers yet.
      </div>
    </section>
  );
}
