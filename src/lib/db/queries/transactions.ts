import "server-only";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, transactions } from "@/lib/db/schema";
import { dateParam } from "@/lib/format/month-nav";

export type TransactionType = "expense" | "income";

export type TransactionInput = {
  type: TransactionType;
  amountMinor: number;
  occurredAt: string;
  comment?: string | null;
  categoryId?: string | null;
};

function monthRange(year: number, month: number) {
  const start = dateParam(year, month, 1);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = dateParam(nextYear, nextMonth, 1);
  return { start, end };
}

export async function getTransactionsForMonth(userId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);

  return db
    .select({
      id: transactions.id,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
      comment: transactions.comment,
      occurredAt: transactions.occurredAt,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, start),
        lt(transactions.occurredAt, end)
      )
    )
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt));
}

export function summarizeMonthTransactions(
  rows: Awaited<ReturnType<typeof getTransactionsForMonth>>,
  year: number,
  month: number
) {
  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  const categoryTotals = new Map<
    string,
    { categoryId: string | null; name: string | null; color: string | null; totalMinor: number }
  >();

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTotals = new Array<number>(daysInMonth).fill(0);

  for (const row of rows) {
    if (row.type === "income") {
      income += row.amountMinor;
      incomeCount++;
      continue;
    }

    expense += row.amountMinor;
    expenseCount++;

    const key = row.categoryId ?? "none";
    const existing = categoryTotals.get(key);
    if (existing) {
      existing.totalMinor += row.amountMinor;
    } else {
      categoryTotals.set(key, {
        categoryId: row.categoryId,
        name: row.categoryName,
        color: row.categoryColor,
        totalMinor: row.amountMinor,
      });
    }

    const day = Number(row.occurredAt.split("-")[2]);
    dailyTotals[day - 1] += row.amountMinor;
  }

  const categoryBreakdown = Array.from(categoryTotals.values()).sort(
    (a, b) => b.totalMinor - a.totalMinor
  );
  const dailyBreakdown = dailyTotals.map((totalMinor, i) => ({ day: i + 1, totalMinor }));

  return {
    summary: { income, expense, balance: income - expense, incomeCount, expenseCount },
    categoryBreakdown,
    dailyBreakdown,
  };
}

export async function createTransaction(userId: string, input: TransactionInput) {
  await db.insert(transactions).values({
    userId,
    type: input.type,
    amountMinor: input.amountMinor,
    comment: input.comment || null,
    occurredAt: input.occurredAt,
    categoryId: input.type === "expense" ? input.categoryId || null : null,
  });
}

export async function updateTransaction(userId: string, id: string, input: TransactionInput) {
  await db
    .update(transactions)
    .set({
      type: input.type,
      amountMinor: input.amountMinor,
      comment: input.comment || null,
      occurredAt: input.occurredAt,
      categoryId: input.type === "expense" ? input.categoryId || null : null,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(userId: string, id: string) {
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
