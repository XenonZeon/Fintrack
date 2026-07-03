import "server-only";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, transactions } from "@/lib/db/schema";

export type TransactionType = "expense" | "income";

export type TransactionInput = {
  type: TransactionType;
  amountMinor: number;
  occurredAt: string;
  comment?: string | null;
  categoryId?: string | null;
};

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
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

export async function getMonthTotals(userId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<string>`coalesce(sum(${transactions.amountMinor}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, start),
        lt(transactions.occurredAt, end)
      )
    )
    .groupBy(transactions.type);

  const income = Number(rows.find((r) => r.type === "income")?.total ?? 0);
  const expense = Number(rows.find((r) => r.type === "expense")?.total ?? 0);

  return { income, expense, balance: income - expense };
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
