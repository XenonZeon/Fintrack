import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getExpenseByCategory,
  getExpenseByDay,
  getMonthSummary,
  getTransactionsForMonth,
} from "@/lib/db/queries/transactions";
import { dayLabel, monthLabel } from "@/lib/format/date-ru";
import { formatRub } from "@/lib/format/money";
import { pluralRu } from "@/lib/format/plural-ru";
import { ru } from "@/lib/i18n/ru";
import { CategoryDonut, DailyExpensesChart } from "./DashboardCharts";

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

function categoryShade(index: number) {
  const l = Math.max(0.28, 0.82 - index * 0.08);
  return `oklch(${l.toFixed(3)} 0 0)`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParamValue } = await searchParams;
  const { year, month } = parseMonthParam(monthParamValue);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const user = await getCurrentUser();
  const userId = user!.id;

  const [summary, categoryRows, dailyRows, monthTransactions] = await Promise.all([
    getMonthSummary(userId, year, month),
    getExpenseByCategory(userId, year, month),
    getExpenseByDay(userId, year, month),
    getTransactionsForMonth(userId, year, month),
  ]);

  const categoryBreakdown = categoryRows
    .filter((c) => c.totalMinor > 0)
    .map((c, i) => ({
      name: c.name ?? ru.transactions.noCategory,
      totalMinor: c.totalMinor,
      shade: categoryShade(i),
    }));

  const budgetUsedPct =
    summary.income > 0 ? Math.min(100, Math.round((summary.expense / summary.income) * 100)) : 0;
  const budgetRemainingPct = summary.income > 0 ? Math.max(0, 100 - budgetUsedPct) : 0;

  const recent = monthTransactions.slice(0, 5).map((t) => ({
    id: t.id,
    dayLabel: dayLabel(t.occurredAt),
    category: t.categoryName ?? ru.transactions.noCategory,
    comment: t.comment ?? "",
    amountLabel: (t.type === "income" ? "+ " : "− ") + formatRub(t.amountMinor) + " ₽",
  }));

  return (
    <div>
      <div className="mb-16 flex items-center justify-between">
        <div className="text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
          {ru.dashboard.breadcrumb}&nbsp;/&nbsp;
          <span className="font-semibold" style={{ color: "var(--app-text)" }}>
            {ru.dashboard.breadcrumbCurrent}
          </span>
        </div>
        <div
          className="flex items-center gap-1 rounded-lg border p-1.5"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <Link
            href={`/dashboard?month=${monthParam(prev.year, prev.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ‹
          </Link>
          <div className="min-w-[120px] px-3 text-center text-[13px] font-semibold">
            {monthLabel(year, month)}
          </div>
          <Link
            href={`/dashboard?month=${monthParam(next.year, next.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="mb-18">
        <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--app-text-dimmer)" }}>
          {ru.dashboard.balanceFor} {monthLabel(year, month)}
        </div>
        <div className="my-3.5 h-px w-full" style={{ background: "var(--app-border-stronger)" }} />
        <div className="-ml-1 whitespace-nowrap text-[112px] font-extrabold leading-none tracking-tight">
          {summary.balance >= 0 ? "+ " : "− "}
          {formatRub(Math.abs(summary.balance))} ₽
        </div>
      </div>

      <div
        className="mb-14 grid grid-cols-3 rounded-lg border py-8"
        style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
      >
        <div className="px-8">
          <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.dashboard.income}
          </div>
          <div className="my-3 h-px" style={{ background: "var(--app-border-strong)" }} />
          <div className="text-[36px] font-bold tracking-tight">{formatRub(summary.income)} ₽</div>
          <div className="mt-2.5 text-xs" style={{ color: "var(--app-text-dimmest)" }}>
            {summary.incomeCount} {pluralRu(summary.incomeCount, ru.dashboard.incomeCount)}
          </div>
        </div>

        <div className="border-l px-8" style={{ borderColor: "var(--app-border-strong)" }}>
          <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.dashboard.expense}
          </div>
          <div className="my-3 h-px" style={{ background: "var(--app-border-strong)" }} />
          <div className="text-[36px] font-bold tracking-tight">{formatRub(summary.expense)} ₽</div>
          <div className="mt-2.5 text-xs" style={{ color: "var(--app-text-dimmest)" }}>
            {summary.expenseCount} {pluralRu(summary.expenseCount, ru.dashboard.expenseCount)}
          </div>
        </div>

        <div className="border-l px-8" style={{ borderColor: "var(--app-border-strong)" }}>
          <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.dashboard.budgetRemaining}
          </div>
          <div className="my-3 h-px" style={{ background: "var(--app-border-strong)" }} />
          <div className="text-[36px] font-bold tracking-tight">{budgetRemainingPct}%</div>
          <div
            className="my-3.5 h-[3px] overflow-hidden rounded-full"
            style={{ background: "var(--app-border-strong)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ background: "oklch(0.75 0 0)", width: `${budgetUsedPct}%` }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--app-text-dimmest)" }}>
            {formatRub(Math.max(0, summary.balance))} ₽ {ru.dashboard.of} {formatRub(summary.income)} ₽
          </div>
        </div>
      </div>

      <div className="mb-14 grid grid-cols-2 items-stretch gap-7">
        <div
          className="rounded-lg border p-7"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <div
            className="mb-5.5 text-[11px] uppercase tracking-wide"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.dashboard.byCategory}
          </div>
          <CategoryDonut data={categoryBreakdown} />
        </div>

        <div
          className="flex flex-col rounded-lg border p-7"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <div
            className="mb-6 text-[11px] uppercase tracking-wide"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.dashboard.byDay}
          </div>
          <DailyExpensesChart data={dailyRows} />
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-baseline justify-between">
          <div className="text-2xl font-extrabold tracking-tight">{ru.dashboard.recentTransactions}</div>
          <Link
            href={`/transactions?month=${monthParam(year, month)}`}
            className="rounded-md px-[18px] py-2.5 text-[13px] font-semibold"
            style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
          >
            {ru.dashboard.allTransactions}
          </Link>
        </div>

        <div
          className="flex px-5 py-3 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--app-text-dimmest)", borderBottom: "1px solid var(--app-border-strong)" }}
        >
          <div className="w-[90px]">{ru.transactions.columnDate}</div>
          <div className="w-[160px]">{ru.transactions.columnCategory}</div>
          <div className="flex-1">{ru.transactions.columnComment}</div>
          <div className="w-[130px] text-right">{ru.transactions.columnAmount}</div>
        </div>

        {recent.length === 0 && (
          <div className="py-16 text-center text-sm" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.transactions.empty}
          </div>
        )}

        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center px-5 py-4 text-sm"
            style={{ borderBottom: "1px solid var(--app-border-faint)" }}
          >
            <div className="w-[90px]" style={{ color: "var(--app-text-dim)" }}>
              {tx.dayLabel}
            </div>
            <div className="w-[160px]" style={{ color: "var(--app-text)" }}>
              {tx.category}
            </div>
            <div className="flex-1 truncate pr-4" style={{ color: "var(--app-text-dim)" }}>
              {tx.comment}
            </div>
            <div className="w-[130px] text-right font-bold">{tx.amountLabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
