import { currentMonth } from "@/lib/format/month-nav";
import { BudgetView } from "./BudgetView";

export const dynamic = "force-dynamic";

export default function BudgetPage() {
  const { year, month } = currentMonth();
  return <BudgetView year={year} month={month} />;
}
