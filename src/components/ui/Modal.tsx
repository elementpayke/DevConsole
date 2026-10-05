export function Modal({
  onClose,
  width = 520,
  zIndexClass = "z-[1000]",
  children,
}: {
  onClose?: () => void;
  width?: number;
  /** Override stacking when opening above drawers (e.g. z-[1100]). */
  zIndexClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center backdrop-blur-sm`}
      style={{ background: "oklch(0.15 0.02 264 / 0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="solid-card max-w-[92vw] rounded-2xl p-7"
        style={{ width, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
      >
        {children}
      </div>
    </div>
  );
}
