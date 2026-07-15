import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { getTransactionsForMonth } from "@/lib/db/queries/transactions";
import { getUserDb } from "@/lib/db/user-db";
import { dayLabel, dayOfMonth, monthLabel } from "@/lib/format/date-ru";
import { formatSignedRub } from "@/lib/format/money";
import { monthParam, shiftMonth } from "@/lib/format/month-nav";
import { ru } from "@/lib/i18n/ru";
import { TransactionsClient } from "./TransactionsClient";

export async function TransactionsView({ year, month }: { year: number; month: number }) {
  const user = await requireCurrentUser();
  const db = await getUserDb();

  const [monthTransactions, allCategories] = await Promise.all([
    getTransactionsForMonth(db, user.id, year, month),
    getCategoriesForUser(db, user.id),
  ]);

  const expenseCategories = allCategories
    .filter((c) => c.kind === "expense")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ id: c.id, name: c.name }));

  const rows = monthTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    dayLabel: dayLabel(t.occurredAt),
    day: dayOfMonth(t.occurredAt),
    category: t.categoryName ?? ru.transactions.noCategory,
    categoryId: t.categoryId,
    comment: t.comment ?? "",
    amountRub: t.amountMinor / 100,
    amountLabel: formatSignedRub(t.amountMinor, t.type),
  }));

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div>
      <div className="mb-16 flex items-center justify-between">
        <Breadcrumb section={ru.transactions.breadcrumb} current={ru.transactions.breadcrumbCurrent} />
        <div
          className="flex items-center gap-1 rounded-lg border p-1.5"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <Link
            href={`/transactions/${monthParam(prev.year, prev.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ‹
          </Link>
          <div className="min-w-[120px] px-3 text-center text-[13px] font-semibold">
            {monthLabel(year, month)}
          </div>
          <Link
            href={`/transactions/${monthParam(next.year, next.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ›
          </Link>
        </div>
      </div>

      <TransactionsClient
        year={year}
        month={month}
        monthLabel={monthLabel(year, month)}
        rows={rows}
        categories={expenseCategories}
      />
    </div>
  );
}
