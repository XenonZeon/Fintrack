"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { upsertBudgetLimits, type BudgetLimitInput } from "@/lib/db/queries/budgets";
import { getUserDb } from "@/lib/db/user-db";
import { parseRublesToMinor } from "@/lib/format/money";
import { ru } from "@/lib/i18n/ru";
import { revalidateBudgetPaths } from "@/lib/revalidate-budget";

export async function saveBudgetLimitsAction(
  year: number,
  month: number,
  formData: FormData
): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const db = await getUserDb();
  const userCategories = await getCategoriesForUser(db, user.id);
  const expenseCategoryIds = userCategories.filter((c) => c.kind === "expense").map((c) => c.id);

  const limits: BudgetLimitInput[] = [];
  for (const categoryId of expenseCategoryIds) {
    const limitMinor = parseRublesToMinor(formData.get(`limit_${categoryId}`));
    if (limitMinor === null || limitMinor < 0) {
      return { error: ru.budgetModal.invalidLimit };
    }
    limits.push({ categoryId, limitMinor });
  }

  try {
    await upsertBudgetLimits(db, user.id, year, month, limits);
  } catch {
    return { error: ru.budgetModal.genericError };
  }

  revalidateBudgetPaths();
  return null;
}
