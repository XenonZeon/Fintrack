"use client";

import { useState } from "react";
import { ru } from "@/lib/i18n/ru";
import { TransactionModal, type CategoryOption, type EditableTransaction } from "./TransactionModal";

export type TransactionRow = {
  id: string;
  type: "expense" | "income";
  dayLabel: string;
  day: number;
  category: string;
  categoryId: string | null;
  comment: string;
  amountRub: number;
  amountLabel: string;
};

export function TransactionsClient({
  year,
  month,
  monthLabel,
  rows,
  categories,
}: {
  year: number;
  month: number;
  monthLabel: string;
  rows: TransactionRow[];
  categories: CategoryOption[];
}) {
  const [modal, setModal] = useState<"new" | TransactionRow | null>(null);

  const editable: EditableTransaction | null =
    modal && modal !== "new"
      ? {
          id: modal.id,
          type: modal.type,
          amountRub: modal.amountRub,
          day: modal.day,
          categoryId: modal.categoryId,
          comment: modal.comment,
        }
      : null;

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between">
        <div className="text-[32px] font-extrabold tracking-tight">
          {ru.transactions.title} — {monthLabel}
        </div>
        <button
          onClick={() => setModal("new")}
          className="rounded-md px-[18px] py-2.5 text-[13px] font-semibold"
          style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
        >
          {ru.transactions.add}
        </button>
      </div>

      <div
        className="flex px-5 py-3 text-[11px] uppercase tracking-wide"
        style={{ color: "var(--app-text-dimmest)", borderBottom: "1px solid var(--app-border-strong)" }}
      >
        <div className="w-[90px]">{ru.transactions.columnDate}</div>
        <div className="w-[160px]">{ru.transactions.columnCategory}</div>
        <div className="flex-1">{ru.transactions.columnComment}</div>
        <div className="w-[130px] text-right">{ru.transactions.columnAmount}</div>
      </div>

      {rows.length === 0 && (
        <div className="py-16 text-center text-sm" style={{ color: "var(--app-text-dimmer)" }}>
          {ru.transactions.empty}
        </div>
      )}

      {rows.map((row) => (
        <button
          key={row.id}
          onClick={() => setModal(row)}
          className="flex w-full items-center px-5 py-4 text-left text-sm"
          style={{ borderBottom: "1px solid var(--app-border-faint)" }}
        >
          <div className="w-[90px]" style={{ color: "var(--app-text-dim)" }}>
            {row.dayLabel}
          </div>
          <div className="w-[160px]" style={{ color: "var(--app-text)" }}>
            {row.category}
          </div>
          <div className="flex-1 truncate pr-4" style={{ color: "var(--app-text-dim)" }}>
            {row.comment}
          </div>
          <div className="w-[130px] text-right font-bold">{row.amountLabel}</div>
        </button>
      ))}

      {modal && (
        <TransactionModal
          year={year}
          month={month}
          categories={categories}
          transaction={editable}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
