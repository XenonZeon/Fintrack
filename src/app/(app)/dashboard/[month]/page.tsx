import { parseMonthParam } from "@/lib/format/month-nav";
import { DashboardView } from "../DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParamValue } = await params;
  const { year, month } = parseMonthParam(monthParamValue);
  return <DashboardView year={year} month={month} />;
}
