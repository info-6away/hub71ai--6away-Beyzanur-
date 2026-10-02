// Calendar dates are passed around as ISO strings (YYYY-MM-DD) and always
// interpreted in UTC, so day arithmetic never shifts with the server's zone.

const DAY_MS = 86_400_000;
const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function toUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Today's calendar date in Abu Dhabi (UTC+4). */
export function todayInAbuDhabi(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const t = toUtc(value);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === value;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** The first day of the month `months` after the month containing `iso`. */
export function firstOfMonthAfter(iso: string, months: number): string {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 10);
}

const monthYear = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" });
const longDate = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

/** "December 2026" */
export const formatMonthYear = (iso: string) => monthYear.format(toUtc(iso));

/** "2 October 2026" */
export const formatLongDate = (iso: string) => longDate.format(toUtc(iso));

/** "02 OCT 2026" — built by hand because en-GB abbreviates September as "Sept". */
export function formatStampDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTHS_SHORT[Number(m) - 1]} ${y}`;
}
