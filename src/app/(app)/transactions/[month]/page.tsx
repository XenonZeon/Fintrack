import { notFound } from "next/navigation";
import { parseMonthParam } from "@/lib/format/month-nav";
import { TransactionsView } from "../TransactionsView";

export const dynamic = "force-dynamic";

export default async function TransactionsMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParamValue } = await params;
  const parsed = parseMonthParam(monthParamValue);
  if (!parsed) notFound();

  return <TransactionsView year={parsed.year} month={parsed.month} />;
}
