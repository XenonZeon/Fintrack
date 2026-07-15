"use client";

import { useState, useTransition } from "react";
import { ModalOverlay, modalInputStyle } from "@/components/ModalOverlay";
import { ru } from "@/lib/i18n/ru";
import { createTransactionAction, deleteTransactionAction, updateTransactionAction } from "./actions";

export type CategoryOption = { id: string; name: string };

export type EditableTransaction = {
  id: string;
  type: "expense" | "income";
  amountRub: number;
  day: number;
  categoryId: string | null;
  comment: string;
};

export function TransactionModal({
  year,
  month,
  categories,
  transaction,
  onClose,
}: {
  year: number;
  month: number;
  categories: CategoryOption[];
  transaction: EditableTransaction | null;
  onClose: () => void;
}) {
  const [type, setType] = useState<"expense" | "income">(transaction?.type ?? "expense");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  const defaultDay =
    transaction?.day ??
    (year === today.getFullYear() && month === today.getMonth() + 1 ? today.getDate() : 1);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = transaction
        ? await updateTransactionAction(transaction.id, formData)
        : await createTransactionAction(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  function handleDelete() {
    if (!transaction) return;
    startTransition(async () => {
      await deleteTransactionAction(transaction.id);
      onClose();
    });
  }

  const inputStyle = modalInputStyle;

  return (
    <ModalOverlay className="w-[420px]">
      <div className="mb-6 text-xl font-extrabold">
        {transaction ? ru.transactionModal.titleEdit : ru.transactionModal.titleNew}
      </div>

      <form action={handleSubmit}>
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="type" value={type} />

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setType("expense")}
            className="flex-1 rounded-md p-2.5 text-[13px] font-semibold"
            style={
              type === "expense"
                ? { background: "var(--app-accent)", color: "var(--app-accent-fg)" }
                : { color: "var(--app-text-dim)" }
            }
          >
            {ru.transactionModal.tabExpense}
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className="flex-1 rounded-md p-2.5 text-[13px] font-semibold"
            style={
              type === "income"
                ? { background: "var(--app-accent)", color: "var(--app-accent-fg)" }
                : { color: "var(--app-text-dim)" }
            }
          >
            {ru.transactionModal.tabIncome}
          </button>
        </div>

        <div className="mb-3.5 flex gap-3">
          <div className="flex-1">
            <div className="mb-1.5 text-[11px] uppercase" style={{ color: "var(--app-text-dimmer)" }}>
              {ru.transactionModal.day}
            </div>
            <input
              name="day"
              type="number"
              min={1}
              max={31}
              required
              defaultValue={defaultDay}
              className="w-full rounded-md border px-3 py-2.5 text-sm"
              style={inputStyle}
            />
          </div>
          <div className="flex-[2]">
            <div className="mb-1.5 text-[11px] uppercase" style={{ color: "var(--app-text-dimmer)" }}>
              {ru.transactionModal.amount}
            </div>
            <input
              name="amount"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={transaction?.amountRub}
              className="w-full rounded-md border px-3 py-2.5 text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        {type === "expense" && (
          <div className="mb-3.5">
            <div className="mb-1.5 text-[11px] uppercase" style={{ color: "var(--app-text-dimmer)" }}>
              {ru.transactionModal.category}
            </div>
            <select
              name="categoryId"
              required
              defaultValue={transaction?.categoryId ?? ""}
              className="w-full rounded-md border px-3 py-2.5 text-sm"
              style={inputStyle}
            >
              <option value="" disabled>
                {ru.transactionModal.category}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-[26px]">
          <div className="mb-1.5 text-[11px] uppercase" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.transactionModal.comment}
          </div>
          <input
            name="comment"
            type="text"
            placeholder={ru.transactionModal.commentPlaceholder}
            defaultValue={transaction?.comment}
            className="w-full rounded-md border px-3 py-2.5 text-sm"
            style={inputStyle}
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border p-3 text-[13px] font-semibold"
            style={{ borderColor: "var(--app-border-stronger)", color: "var(--app-text-dim)" }}
          >
            {ru.transactionModal.cancel}
          </button>
          {transaction && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-md border p-3 text-[13px] font-semibold text-red-400"
              style={{ borderColor: "var(--app-border-stronger)" }}
            >
              {ru.transactionModal.delete}
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md p-3 text-[13px] font-bold"
            style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
          >
            {transaction ? ru.transactionModal.submitEdit : ru.transactionModal.submitNew}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
