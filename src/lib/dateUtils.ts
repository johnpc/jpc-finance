export const formatBudgetMonth = (date: Date): string =>
  date.toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" });

export const formatTransactionDate = (date: Date): string =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "long" });

export const formatFullDate = (date: Date): string => date.toLocaleDateString();

export const formatMonthYear = (date: Date): string =>
  date.toLocaleString(undefined, { month: "long", year: "numeric" });

export const formatMonth = (date: Date): string =>
  date.toLocaleString(undefined, { month: "long" });
