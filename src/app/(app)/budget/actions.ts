"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { upsertBudgetLimits, type BudgetLimitInput } from "@/lib/db/queries/budgets";
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

  const userCategories = await getCategoriesForUser(user.id);
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
    await upsertBudgetLimits(user.id, year, month, limits);
  } catch {
    return { error: ru.budgetModal.genericError };
  }

  revalidateBudgetPaths();
  return null;
}
