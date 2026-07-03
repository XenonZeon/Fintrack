import { ru } from "@/lib/i18n/ru";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p style={{ color: "var(--app-text-dim)" }}>{ru.dashboard.empty}</p>
    </div>
  );
}
