import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Продукты", icon: "🛒", color: "#22c55e" },
  { name: "Транспорт", icon: "🚗", color: "#3b82f6" },
  { name: "Жильё", icon: "🏠", color: "#f59e0b" },
  { name: "Развлечения", icon: "🎉", color: "#a855f7" },
  { name: "Здоровье", icon: "💊", color: "#ef4444" },
  { name: "Одежда", icon: "👕", color: "#ec4899" },
  { name: "Связь", icon: "📱", color: "#06b6d4" },
  { name: "Прочее", icon: "📦", color: "#6b7280" },
];

export async function getCategoriesForUser(userId: string) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
  });
}

export async function seedDefaultCategoriesIfMissing(userId: string) {
  const existing = await getCategoriesForUser(userId);
  if (existing.length > 0) return;

  await db
    .insert(categories)
    .values(
      DEFAULT_EXPENSE_CATEGORIES.map((category, index) => ({
        userId,
        name: category.name,
        kind: "expense" as const,
        icon: category.icon,
        color: category.color,
        sortOrder: index,
        isDefault: true,
      }))
    )
    .onConflictDoNothing({ target: [categories.userId, categories.name] });
}
