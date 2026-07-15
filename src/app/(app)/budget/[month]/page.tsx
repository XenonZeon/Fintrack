import { notFound } from "next/navigation";
import { parseMonthParam } from "@/lib/format/month-nav";
import { BudgetView } from "../BudgetView";

export const dynamic = "force-dynamic";

export default async function BudgetMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParamValue } = await params;
  const parsed = parseMonthParam(monthParamValue);
  if (!parsed) notFound();

  return <BudgetView year={parsed.year} month={parsed.month} />;
}
