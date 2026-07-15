"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { upsertBudgetLimits, type BudgetLimitInput } from "@/lib/db/queries/budgets";
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
    const raw = formData.get(`limit_${categoryId}`);
    const rubles = Number(raw ?? 0);
    if (!Number.isFinite(rubles) || rubles < 0) {
      return { error: ru.budgetModal.invalidLimit };
    }
    limits.push({ categoryId, limitMinor: Math.round(rubles * 100) });
  }

  await upsertBudgetLimits(user.id, year, month, limits);
  revalidateBudgetPaths();
  return null;
}
