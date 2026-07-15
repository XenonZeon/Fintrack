import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getBudgetsForMonth } from "@/lib/db/queries/budgets";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { getTransactionsForMonth, summarizeMonthTransactions } from "@/lib/db/queries/transactions";
import { monthLabel } from "@/lib/format/date-ru";
import { monthParam, shiftMonth } from "@/lib/format/month-nav";
import { ru } from "@/lib/i18n/ru";
import { BudgetClient, type BudgetCategory } from "./BudgetClient";

export async function BudgetView({ year, month }: { year: number; month: number }) {
  const user = await requireCurrentUser();

  const [allCategories, budgetRows, monthTransactions] = await Promise.all([
    getCategoriesForUser(user.id),
    getBudgetsForMonth(user.id, year, month),
    getTransactionsForMonth(user.id, year, month),
  ]);

  const { categoryBreakdown } = summarizeMonthTransactions(monthTransactions, year, month);
  const spentByCategoryId = new Map(categoryBreakdown.map((c) => [c.categoryId, c.totalMinor]));
  const limitByCategoryId = new Map(budgetRows.map((b) => [b.categoryId, b.limitMinor]));

  const expenseCategories: BudgetCategory[] = allCategories
    .filter((c) => c.kind === "expense")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      id: c.id,
      name: c.name,
      spentMinor: spentByCategoryId.get(c.id) ?? 0,
      limitMinor: limitByCategoryId.get(c.id) ?? 0,
    }));

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div>
      <div className="mb-16 flex items-center justify-between">
        <Breadcrumb section={ru.budget.breadcrumb} current={ru.budget.breadcrumbCurrent} />
        <div
          className="flex items-center gap-1 rounded-lg border p-1.5"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <Link
            href={`/budget/${monthParam(prev.year, prev.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ‹
          </Link>
          <div className="min-w-[120px] px-3 text-center text-[13px] font-semibold">
            {monthLabel(year, month)}
          </div>
          <Link
            href={`/budget/${monthParam(next.year, next.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ›
          </Link>
        </div>
      </div>

      <BudgetClient
        year={year}
        month={month}
        monthLabel={monthLabel(year, month)}
        categories={expenseCategories}
      />
    </div>
  );
}
