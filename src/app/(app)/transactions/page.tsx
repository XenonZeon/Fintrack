import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { getMonthTotals, getTransactionsForMonth } from "@/lib/db/queries/transactions";
import { dayLabel, monthLabel } from "@/lib/format/date-ru";
import { formatRub } from "@/lib/format/money";
import { ru } from "@/lib/i18n/ru";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = "force-dynamic";

function parseMonthParam(param: string | undefined) {
  const now = new Date();
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParamValue } = await searchParams;
  const { year, month } = parseMonthParam(monthParamValue);

  const { data: session } = await auth.getSession();
  const userId = session!.user.id;

  const [monthTransactions, totals, allCategories] = await Promise.all([
    getTransactionsForMonth(userId, year, month),
    getMonthTotals(userId, year, month),
    getCategoriesForUser(userId),
  ]);

  const expenseCategories = allCategories
    .filter((c) => c.kind === "expense")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ id: c.id, name: c.name }));

  const rows = monthTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    dayLabel: dayLabel(t.occurredAt),
    day: Number(t.occurredAt.split("-")[2]),
    category: t.categoryName ?? ru.transactions.noCategory,
    categoryId: t.categoryId,
    comment: t.comment ?? "",
    amountRub: t.amountMinor / 100,
    amountLabel: (t.type === "income" ? "+ " : "− ") + formatRub(t.amountMinor) + " ₽",
  }));

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div>
      <div className="mb-16 flex items-center justify-between">
        <div className="text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
          {ru.transactions.breadcrumb}&nbsp;/&nbsp;
          <span className="font-semibold" style={{ color: "var(--app-text)" }}>
            {ru.transactions.breadcrumbCurrent}
          </span>
        </div>
        <div
          className="flex items-center gap-1 rounded-lg border p-1.5"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <Link
            href={`/transactions?month=${monthParam(prev.year, prev.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ‹
          </Link>
          <div className="min-w-[120px] px-3 text-center text-[13px] font-semibold">
            {monthLabel(year, month)}
          </div>
          <Link
            href={`/transactions?month=${monthParam(next.year, next.month)}`}
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
        totals={totals}
        rows={rows}
        categories={expenseCategories}
      />
    </div>
  );
}
