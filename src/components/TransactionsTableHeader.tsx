import { ru } from "@/lib/i18n/ru";

export function TransactionsTableHeader() {
  return (
    <div
      className="flex px-5 py-3 text-[11px] uppercase tracking-wide"
      style={{ color: "var(--app-text-dimmest)", borderBottom: "1px solid var(--app-border-strong)" }}
    >
      <div className="w-[90px]">{ru.transactions.columnDate}</div>
      <div className="w-[160px]">{ru.transactions.columnCategory}</div>
      <div className="flex-1">{ru.transactions.columnComment}</div>
      <div className="w-[130px] text-right">{ru.transactions.columnAmount}</div>
    </div>
  );
}
