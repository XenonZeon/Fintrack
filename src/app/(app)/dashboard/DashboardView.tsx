import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TransactionsTableHeader } from "@/components/TransactionsTableHeader";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTransactionsForMonth, summarizeMonthTransactions } from "@/lib/db/queries/transactions";
import { dayLabel, monthLabel } from "@/lib/format/date-ru";
import { formatRub, formatSignedRub } from "@/lib/format/money";
import { monthParam, shiftMonth } from "@/lib/format/month-nav";
import { pluralRu } from "@/lib/format/plural-ru";
import { ru } from "@/lib/i18n/ru";
import { CategoryDonut, DailyExpensesChart } from "./DashboardCharts";

const NO_CATEGORY_COLOR = "oklch(0.5 0 0)";
const OVERSPEND_COLOR = "oklch(0.7 0.13 25)";

export async function DashboardView({ year, month }: { year: number; month: number }) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const user = await requireCurrentUser();

  const monthTransactions = await getTransactionsForMonth(user.id, year, month);
  const { summary, categoryBreakdown, dailyBreakdown } = summarizeMonthTransactions(
    monthTransactions,
    year,
    month
  );

  const categorySlices = categoryBreakdown
    .filter((c) => c.totalMinor > 0)
    .map((c) => ({
      name: c.name ?? ru.transactions.noCategory,
      totalMinor: c.totalMinor,
      color: c.color ?? NO_CATEGORY_COLOR,
    }));

  const hasIncome = summary.income > 0;
  const budgetUsedPctRaw = hasIncome
    ? (summary.expense / summary.income) * 100
    : summary.expense > 0
      ? 100
      : 0;
  const budgetUsedPct = Math.min(100, Math.round(budgetUsedPctRaw));
  const budgetRemainingPct = Math.round(100 - budgetUsedPctRaw);
  const overspent = summary.expense > summary.income;

  const recent = monthTransactions.slice(0, 5).map((t) => ({
    id: t.id,
    dayLabel: dayLabel(t.occurredAt),
    category: t.categoryName ?? ru.transactions.noCategory,
    comment: t.comment ?? "",
    amountLabel: formatSignedRub(t.amountMinor, t.type),
  }));

  return (
    <div>
      <div className="mb-16 flex items-center justify-between">
        <Breadcrumb section={ru.dashboard.breadcrumb} current={ru.dashboard.breadcrumbCurrent} />
        <div
          className="flex items-center gap-1 rounded-lg border p-1.5"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <Link
            href={`/dashboard/${monthParam(prev.year, prev.month)}`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
          >
            ‹
          </Link>
          <div className="min-w-[120px] px-3 text-center text-[13px] font-semibold">
            {monthLabel(year, month)}
          </div>
          <Link
            href={`/dashboard/${monthParam(next.year, next.month)}`}
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
        <div
          className="-ml-1 whitespace-nowrap text-[112px] font-extrabold leading-none tracking-tight"
          style={overspent ? { color: OVERSPEND_COLOR } : undefined}
        >
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
          <div
            className="text-[36px] font-bold tracking-tight"
            style={overspent ? { color: OVERSPEND_COLOR } : undefined}
          >
            {budgetRemainingPct}%
          </div>
          <div
            className="my-3.5 h-[3px] overflow-hidden rounded-full"
            style={{ background: "var(--app-border-strong)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ background: overspent ? OVERSPEND_COLOR : "oklch(0.75 0 0)", width: `${budgetUsedPct}%` }}
            />
          </div>
          <div className="text-xs" style={{ color: overspent ? OVERSPEND_COLOR : "var(--app-text-dimmest)" }}>
            {overspent
              ? `${ru.budget.overspend} ${formatRub(summary.expense - summary.income)} ₽`
              : `${formatRub(Math.max(0, summary.balance))} ₽ ${ru.dashboard.of} ${formatRub(summary.income)} ₽`}
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
          <CategoryDonut data={categorySlices} />
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
          <DailyExpensesChart data={dailyBreakdown} />
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-baseline justify-between">
          <div className="text-2xl font-extrabold tracking-tight">{ru.dashboard.recentTransactions}</div>
          <Link
            href={`/transactions/${monthParam(year, month)}`}
            className="rounded-md px-[18px] py-2.5 text-[13px] font-semibold"
            style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
          >
            {ru.dashboard.allTransactions}
          </Link>
        </div>

        <TransactionsTableHeader />

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
