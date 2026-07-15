import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { budgets } from "@/lib/db/schema";
import { dateParam } from "@/lib/format/month-nav";

export type BudgetLimitInput = { categoryId: string; limitMinor: number };

function periodMonthParam(year: number, month: number) {
  return dateParam(year, month, 1);
}

export async function getBudgetsForMonth(db: Db, userId: string, year: number, month: number) {
  return db.query.budgets.findMany({
    where: and(eq(budgets.userId, userId), eq(budgets.periodMonth, periodMonthParam(year, month))),
  });
}

export async function upsertBudgetLimits(
  db: Db,
  userId: string,
  year: number,
  month: number,
  limits: BudgetLimitInput[]
) {
  const periodMonth = periodMonthParam(year, month);
  const toUpsert = limits.filter((l) => l.limitMinor > 0);
  const toClear = limits.filter((l) => l.limitMinor === 0).map((l) => l.categoryId);

  const upsertQuery = toUpsert.length > 0
    ? db
        .insert(budgets)
        .values(toUpsert.map((l) => ({ userId, categoryId: l.categoryId, periodMonth, limitMinor: l.limitMinor })))
        .onConflictDoUpdate({
          target: [budgets.userId, budgets.categoryId, budgets.periodMonth],
          set: { limitMinor: sql`excluded.limit_minor` },
        })
    : null;

  const clearQuery = toClear.length > 0
    ? db
        .delete(budgets)
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.periodMonth, periodMonth),
            inArray(budgets.categoryId, toClear)
          )
        )
    : null;

  // db.transaction() is unsupported over the neon-http driver; db.batch() runs both
  // statements as a single atomic HTTP transaction so a save can't half-apply.
  if (upsertQuery && clearQuery) {
    await db.batch([upsertQuery, clearQuery]);
  } else if (upsertQuery) {
    await upsertQuery;
  } else if (clearQuery) {
    await clearQuery;
  }
}
