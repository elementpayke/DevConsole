export function Badge({
  bg,
  color,
  dot,
  children,
}: {
  bg: string;
  color: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-bold"
      style={{ background: bg, color }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}
