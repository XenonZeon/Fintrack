"use client";

import { useState } from "react";
import { formatRub } from "@/lib/format/money";
import { ru } from "@/lib/i18n/ru";
import { BudgetLimitsModal } from "./BudgetLimitsModal";

export type BudgetCategory = {
  id: string;
  name: string;
  spentMinor: number;
  limitMinor: number;
};

const OVERSPEND_COLOR = "oklch(0.7 0.13 25)";
const BAR_COLOR = "oklch(0.75 0 0)";

export function BudgetClient({
  year,
  month,
  monthLabel,
  categories,
}: {
  year: number;
  month: number;
  monthLabel: string;
  categories: BudgetCategory[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="text-[32px] font-extrabold tracking-tight">
          {ru.budget.titlePrefix} {monthLabel}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex-none rounded-md border px-[18px] py-2.5 text-[13px] font-semibold whitespace-nowrap"
          style={{ borderColor: "var(--app-border-strong)" }}
        >
          {ru.budget.configureLimits}
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {categories.map((category) => {
          const { limitMinor, spentMinor } = category;
          const hasLimit = limitMinor > 0;
          const pctUsed = hasLimit ? (spentMinor / limitMinor) * 100 : 0;
          const overspend = hasLimit && spentMinor > limitMinor;
          const fullyUsed = hasLimit && spentMinor === limitMinor;
          const barWidthPct = Math.min(100, pctUsed);

          return (
            <div
              key={category.id}
              className="rounded-lg border px-6.5 py-5.5"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <div className="text-[15px] font-bold">{category.name}</div>
                <div className="text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
                  {formatRub(spentMinor)} ₽{" "}
                  <span style={{ color: "var(--app-text-faint)" }}>{ru.budget.of}</span>{" "}
                  {formatRub(limitMinor)} ₽
                </div>
              </div>
              <div
                className="mb-2.5 h-1.5 overflow-hidden rounded-full"
                style={{ background: "var(--app-border-faint)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${barWidthPct}%`, background: overspend ? OVERSPEND_COLOR : BAR_COLOR }}
                />
              </div>
              <div
                className="text-xs"
                style={{ color: overspend ? OVERSPEND_COLOR : "var(--app-text-dimmest)" }}
              >
                {!hasLimit
                  ? ru.budget.noLimit
                  : fullyUsed
                    ? ru.budget.fullyUsed
                    : overspend
                      ? `${ru.budget.overspend} ${formatRub(spentMinor - limitMinor)} ₽`
                      : `${ru.budget.remaining} ${formatRub(limitMinor - spentMinor)} ₽ · ${Math.round(pctUsed)}% ${ru.budget.ofLimit}`}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <BudgetLimitsModal
          year={year}
          month={month}
          categories={categories}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
