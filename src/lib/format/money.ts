export function formatRub(amountMinor: number) {
  const rubles = amountMinor / 100;
  const rounded = rubles < 0 ? -Math.round(-rubles) : Math.round(rubles);
  return new Intl.NumberFormat("ru-RU").format(rounded);
}

export function formatSignedRub(amountMinor: number, type: "income" | "expense") {
  const sign = type === "income" ? "+ " : "− ";
  return `${sign}${formatRub(amountMinor)} ₽`;
}

export function parseRublesToMinor(raw: FormDataEntryValue | null): number | null {
  const rubles = Number(raw ?? 0);
  if (!Number.isFinite(rubles)) return null;
  return Math.round(rubles * 100);
}
