export function Breadcrumb({ section, current }: { section: string; current: string }) {
  return (
    <div className="text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
      {section}&nbsp;/&nbsp;
      <span className="font-semibold" style={{ color: "var(--app-text)" }}>
        {current}
      </span>
    </div>
  );
}
