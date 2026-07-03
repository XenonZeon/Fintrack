import { notFound } from "next/navigation";
import { parseMonthParam } from "@/lib/format/month-nav";
import { DashboardView } from "../DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParamValue } = await params;
  const parsed = parseMonthParam(monthParamValue);
  if (!parsed) notFound();

  return <DashboardView year={parsed.year} month={parsed.month} />;
}
