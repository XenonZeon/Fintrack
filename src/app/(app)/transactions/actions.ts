"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionInput,
} from "@/lib/db/queries/transactions";
import { ru } from "@/lib/i18n/ru";

function parseInput(formData: FormData): TransactionInput | { error: string } {
  const type = formData.get("type") === "income" ? "income" : "expense";
  const rubles = Number(formData.get("amount"));
  const day = Number(formData.get("day"));
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const comment = (formData.get("comment") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;

  if (type === "expense" && !categoryId) {
    return { error: ru.transactionModal.categoryRequired };
  }

  return {
    type,
    amountMinor: Math.round(rubles * 100),
    occurredAt: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    comment,
    categoryId,
  };
}

export async function createTransactionAction(
  formData: FormData
): Promise<{ error: string } | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const input = parseInput(formData);
  if ("error" in input) return input;

  await createTransaction(session.user.id, input);
  revalidatePath("/transactions");
  return null;
}

export async function updateTransactionAction(
  id: string,
  formData: FormData
): Promise<{ error: string } | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const input = parseInput(formData);
  if ("error" in input) return input;

  await updateTransaction(session.user.id, id, input);
  revalidatePath("/transactions");
  return null;
}

export async function deleteTransactionAction(id: string): Promise<{ error: string } | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  await deleteTransaction(session.user.id, id);
  revalidatePath("/transactions");
  return null;
}
