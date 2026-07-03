export function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function parseMonthParam(param: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(param);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

export function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function dateParam(year: number, month: number, day: number) {
  return `${monthParam(year, month)}-${String(day).padStart(2, "0")}`;
}
