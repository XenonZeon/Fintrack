import { currentMonth } from "@/lib/format/month-nav";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { year, month } = currentMonth();
  return <DashboardView year={year} month={month} />;
}
