"use client";

import { useState, useTransition } from "react";
import { ru } from "@/lib/i18n/ru";
import { saveBudgetLimitsAction } from "./actions";
import type { BudgetCategory } from "./BudgetClient";

export function BudgetLimitsModal({
  year,
  month,
  categories,
  onClose,
}: {
  year: number;
  month: number;
  categories: BudgetCategory[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputStyle = {
    background: "var(--app-bg-input)",
    borderColor: "var(--app-border-strong)",
    color: "var(--app-text)",
  };

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveBudgetLimitsAction(year, month, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="max-h-[82vh] w-[440px] overflow-y-auto rounded-[10px] border p-8"
        style={{ background: "var(--app-bg-modal)", borderColor: "var(--app-border-strong)" }}
      >
        <div className="mb-1.5 text-xl font-extrabold">{ru.budgetModal.title}</div>
        <div className="mb-6 text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
          {ru.budgetModal.subtitle}
        </div>

        <form action={handleSubmit}>
          <div className="mb-6.5 flex flex-col gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3">
                <div className="flex-1 text-sm" style={{ color: "var(--app-text-dim)" }}>
                  {category.name}
                </div>
                <div className="relative w-[100px]">
                  <input
                    name={`limit_${category.id}`}
                    type="number"
                    min={0}
                    step="1"
                    defaultValue={category.limitMinor / 100}
                    className="w-full rounded-md border py-2.25 pr-7.5 pl-3 text-right text-sm"
                    style={inputStyle}
                  />
                  <div
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px]"
                    style={{ color: "var(--app-text-dimmer)" }}
                  >
                    ₽
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border p-3 text-[13px] font-semibold"
              style={{ borderColor: "var(--app-border-stronger)", color: "var(--app-text-dim)" }}
            >
              {ru.budgetModal.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-md p-3 text-[13px] font-bold"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              {ru.budgetModal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
