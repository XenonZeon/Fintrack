"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getCategoryById } from "@/lib/db/queries/categories";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionInput,
} from "@/lib/db/queries/transactions";
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

  const occurredAt = dateParam(year, month, day);
  if (Number.isNaN(new Date(occurredAt).getTime())) {
    return { error: ru.transactionModal.dateInvalid };
  }

  return {
    type,
    amountMinor,
    occurredAt,
    comment,
    categoryId,
  };
}

async function validateCategoryOwnership(
  userId: string,
  input: TransactionInput
): Promise<{ error: string } | null> {
  if (input.type !== "expense" || !input.categoryId) return null;

  const category = await getCategoryById(userId, input.categoryId);
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

  const categoryError = await validateCategoryOwnership(user.id, input);
  if (categoryError) return categoryError;

  await createTransaction(user.id, input);
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

  const categoryError = await validateCategoryOwnership(user.id, input);
  if (categoryError) return categoryError;

  await updateTransaction(user.id, id, input);
  revalidateTransactionPaths();
  return null;
}

export async function deleteTransactionAction(id: string): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await deleteTransaction(user.id, id);
  revalidateTransactionPaths();
  return null;
}
