export function parseMonthParam(param: string | undefined) {
  const now = new Date();
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
