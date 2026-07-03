import { currentMonth } from "@/lib/format/month-nav";
import { TransactionsView } from "./TransactionsView";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  const { year, month } = currentMonth();
  return <TransactionsView year={year} month={month} />;
}
