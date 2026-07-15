"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { Db } from "@/lib/db";
import { getCategoryById } from "@/lib/db/queries/categories";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionInput,
} from "@/lib/db/queries/transactions";
import { getUserDb } from "@/lib/db/user-db";
import { parseRublesToMinor } from "@/lib/format/money";
import { dateParam } from "@/lib/format/month-nav";
import { ru } from "@/lib/i18n/ru";
import { revalidateTransactionPaths } from "@/lib/revalidate-transactions";

function parseInput(formData: FormData): TransactionInput | { error: string } {
  const type = formData.get("type") === "income" ? "income" : "expense";
  const amountMinor = parseRublesToMinor(formData.get("amount"));
  const day = Number(formData.get("day"));
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const comment = (formData.get("comment") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;

  if (amountMinor === null || amountMinor <= 0) {
    return { error: ru.transactionModal.amountInvalid };
  }

  if (type === "expense" && !categoryId) {
    return { error: ru.transactionModal.categoryRequired };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth) {
    return { error: ru.transactionModal.dateInvalid };
  }

  const occurredAt = dateParam(year, month, day);

  return {
    type,
    amountMinor,
    occurredAt,
    comment,
    categoryId,
  };
}

async function validateCategoryOwnership(
  db: Db,
  userId: string,
  input: TransactionInput
): Promise<{ error: string } | null> {
  if (input.type !== "expense" || !input.categoryId) return null;

  const category = await getCategoryById(db, userId, input.categoryId);
  if (!category || category.kind !== "expense") {
    return { error: ru.transactionModal.categoryInvalid };
  }
  return null;
}

export async function createTransactionAction(
  formData: FormData
): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const input = parseInput(formData);
  if ("error" in input) return input;

  const db = await getUserDb();
  const categoryError = await validateCategoryOwnership(db, user.id, input);
  if (categoryError) return categoryError;

  await createTransaction(db, user.id, input);
  revalidateTransactionPaths();
  return null;
}

export async function updateTransactionAction(
  id: string,
  formData: FormData
): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const input = parseInput(formData);
  if ("error" in input) return input;

  const db = await getUserDb();
  const categoryError = await validateCategoryOwnership(db, user.id, input);
  if (categoryError) return categoryError;

  await updateTransaction(db, user.id, id, input);
  revalidateTransactionPaths();
  return null;
}

export async function deleteTransactionAction(id: string): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const db = await getUserDb();
  await deleteTransaction(db, user.id, id);
  revalidateTransactionPaths();
  return null;
}
