export type ParsedTransactionMessage = {
  type: "expense" | "income";
  amountMinor: number;
  comment: string | null;
  categoryKeyword: string | null;
};

const INCOME_KEYWORDS = ["доход", "зарплата", "зп", "аванс", "премия", "возврат", "кэшбэк", "кешбэк"];

// Ключевые слова для сопоставления с дефолтными категориями расходов (см. seedDefaultCategoriesIfMissing).
// Кастомные категории (задача 8) сопоставляться по ключевым словам не будут — только по точному имени.
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Продукты": ["продукты", "еда", "магазин", "супермаркет", "пятерочка", "пятёрочка", "магнит", "перекресток", "перекрёсток", "ашан", "кофе", "обед", "ужин", "завтрак"],
  "Транспорт": ["транспорт", "такси", "метро", "автобус", "бензин", "проезд", "заправка"],
  "Жильё": ["жильё", "жилье", "аренда", "квартира", "жкх", "коммуналка"],
  "Развлечения": ["развлечения", "кино", "бар", "ресторан", "кафе", "игры", "концерт", "kfc", "кфс", "макдоналдс", "макдональдс", "mcdonalds", "бургер кинг", "burger king", "вкусно и точка", "subway"],
  "Здоровье": ["здоровье", "аптека", "врач", "лекарства", "стоматолог"],
  "Одежда": ["одежда", "обувь"],
  "Связь": ["связь", "интернет", "телефон", "мобильный"],
};

function normalize(text: string) {
  return text.toLowerCase().replace(/ё/g, "е");
}

export function matchCategoryKeyword(rest: string): string | null {
  const normalized = normalize(rest);
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return categoryName;
    }
  }
  return null;
}

export function parseTransactionMessage(text: string): ParsedTransactionMessage | { error: true } {
  const numberMatch = text.match(/([+-]?\d+(?:[.,]\d+)?)/);
  if (!numberMatch || numberMatch.index === undefined) return { error: true };

  const numStr = numberMatch[0];
  const amount = Number(numStr.replace(",", ".").replace("+", ""));
  if (!Number.isFinite(amount) || amount <= 0) return { error: true };

  const rest = (text.slice(0, numberMatch.index) + " " + text.slice(numberMatch.index + numStr.length))
    .replace(/\s+/g, " ")
    .trim();

  const isIncome = numStr.startsWith("+") || INCOME_KEYWORDS.some((keyword) => normalize(rest).includes(keyword));

  return {
    type: isIncome ? "income" : "expense",
    amountMinor: Math.round(amount * 100),
    comment: rest || null,
    categoryKeyword: isIncome ? null : matchCategoryKeyword(rest),
  };
}
