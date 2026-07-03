import { parseMonthParam } from "@/lib/format/month-nav";
import { TransactionsView } from "../TransactionsView";

export const dynamic = "force-dynamic";

export default async function TransactionsMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParamValue } = await params;
  const { year, month } = parseMonthParam(monthParamValue);
  return <TransactionsView year={year} month={month} />;
}
