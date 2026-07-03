import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const now = new Date();
  return <DashboardView year={now.getFullYear()} month={now.getMonth() + 1} />;
}
