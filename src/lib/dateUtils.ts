// The backend partitions transactions and budgets by an en-US "MM/yy" month
// string. Formatting with the browser's locale would produce "11.26" or
// "26/11" elsewhere and silently miss every row, so the locale is pinned.
const LOCALE = "en-US";

export const formatBudgetMonth = (date: Date): string =>
  date.toLocaleDateString(LOCALE, { month: "2-digit", year: "2-digit" });

export const formatMonthYear = (date: Date): string =>
  date.toLocaleString(LOCALE, { month: "long", year: "numeric" });

export const formatShortDate = (date: Date): string =>
  date.toLocaleDateString(LOCALE, { month: "short", day: "numeric" });

export const formatTimestamp = (date: Date): string =>
  date.toLocaleString(LOCALE, {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });

/** The "as of" date string the Plaid sync Lambda parses with `new Date()`. */
export const formatSyncDate = (date: Date): string =>
  date.toLocaleString(LOCALE);

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/**
 * The month being viewed is captured when the page loads and goes stale if
 * the tab stays open; the Lambda uses it as Plaid's end_date, so a stale value
 * silently skips every newer transaction. Viewing the current month syncs as
 * of now; a deliberately viewed other month keeps its own date.
 */
export const resolveSyncDate = (viewed: Date, now: Date): Date =>
  isSameMonth(viewed, now) ? now : viewed;

/** Parse "MM/yy" back into the first day of that month. */
export const parseBudgetMonth = (budgetMonth: string): Date => {
  const [month, year] = budgetMonth.split("/").map(Number);
  return new Date(2000 + year, month - 1);
};
