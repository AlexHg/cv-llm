export interface CvDate {
  year: number;
  month?: number;
}

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export function assertCvDate(date: CvDate, label: string) {
  if (!Number.isInteger(date.year) || date.year < 1900 || date.year > 2100) {
    throw new Error(`${label}: año inválido`);
  }

  if (date.month != null && (date.month < 1 || date.month > 12)) {
    throw new Error(`${label}: mes inválido`);
  }
}

function resolvedMonth(date: CvDate, bound: "start" | "end") {
  return date.month ?? (bound === "start" ? 1 : 12);
}

export function dateIndex(date: CvDate, bound: "start" | "end") {
  return date.year * 12 + resolvedMonth(date, bound);
}

export function compareDates(
  left: CvDate,
  right: CvDate,
  bound: "start" | "end" = "start",
) {
  return dateIndex(left, bound) - dateIndex(right, bound);
}

export function minDate(left: CvDate, right: CvDate): CvDate {
  return compareDates(left, right, "start") <= 0 ? left : right;
}

export function maxDate(left: CvDate, right: CvDate): CvDate {
  return compareDates(left, right, "end") >= 0 ? left : right;
}

/**
 * Meses transcurridos a granularidad de mes.
 * Jun 2019 → Jul 2024 = 61; Jul 2024 → Mar 2026 = 20.
 * Si ambos extremos son solo año, cuenta años inclusivos (2023–2025 = 36).
 */
export function monthsBetween(start: CvDate, end: CvDate) {
  assertCvDate(start, "start");
  assertCvDate(end, "end");

  if (start.month == null && end.month == null) {
    return Math.max(0, end.year - start.year + 1) * 12;
  }

  return Math.max(0, dateIndex(end, "end") - dateIndex(start, "start"));
}

export function formatDuration(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = years === 1 ? "1 año" : years > 1 ? `${years} años` : "";
  const monthPart = rest === 1 ? "1 mes" : rest > 1 ? `${rest} meses` : "";

  if (yearPart && monthPart) return `${yearPart} y ${monthPart}`;
  if (yearPart) return yearPart;
  if (monthPart) return monthPart;
  return "menos de 1 mes";
}

export function formatPeriod(start: CvDate, end: CvDate) {
  assertCvDate(start, "start");
  assertCvDate(end, "end");

  if (start.month == null && end.month == null) {
    return start.year === end.year
      ? `${start.year}`
      : `${start.year} – ${end.year}`;
  }

  const startLabel = `${MONTHS_ES[resolvedMonth(start, "start") - 1]} ${start.year}`;
  const endLabel = `${MONTHS_ES[resolvedMonth(end, "end") - 1]} ${end.year}`;
  return `${startLabel} – ${endLabel}`;
}

export function hydrateSpan(start: CvDate, end: CvDate) {
  const durationMonths = monthsBetween(start, end);

  return {
    start,
    end,
    period: formatPeriod(start, end),
    durationMonths,
    durationLabel: formatDuration(durationMonths),
  };
}
