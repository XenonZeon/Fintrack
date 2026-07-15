export const modalInputStyle = {
  background: "var(--app-bg-input)",
  borderColor: "var(--app-border-strong)",
  color: "var(--app-text)",
};

export function ModalOverlay({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className={`rounded-[10px] border p-8 ${className ?? ""}`}
        style={{ background: "var(--app-bg-modal)", borderColor: "var(--app-border-strong)" }}
      >
        {children}
      </div>
    </div>
  );
}
