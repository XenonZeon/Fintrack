const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function monthLabel(year: number, month: number) {
  return `${MONTHS_NOMINATIVE[month - 1]} ${year}`;
}

export function dayLabel(occurredAt: string) {
  const [, m, d] = occurredAt.split("-").map(Number);
  return `${d} ${MONTHS_GENITIVE[m - 1]}`;
}

export function fullDateLabel(date: Date) {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}
