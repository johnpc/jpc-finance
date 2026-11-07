import {
  CATEGORY_TYPES,
  CategoryEntity,
  CategoryType,
  TransactionEntity,
} from "./types";

type TransactionRow = {
  id: string;
  amount: number;
  transactionMonth: string;
  date: string;
  name: string;
  displayName?: string | null;
  pending: boolean;
  deleted?: boolean | null;
  budgetCategoryTransactionsId?: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
  type: string;
  plannedAmount: number;
};

const isCategoryType = (value: string): value is CategoryType =>
  (CATEGORY_TYPES as readonly string[]).includes(value);

/**
 * `date` is a calendar day ("2026-11-07"). `new Date("2026-11-07")` parses as
 * UTC midnight, which renders as the previous day west of UTC — so build it
 * as a local date instead.
 */
export const parseCalendarDay = (day: string): Date => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
};

export const toTransactionEntity = (t: TransactionRow): TransactionEntity => ({
  id: t.id,
  amount: t.amount * -1,
  transactionMonth: t.transactionMonth,
  date: parseCalendarDay(t.date),
  name: t.name,
  displayName: t.displayName,
  pending: t.pending,
  budgetCategoryId: t.budgetCategoryTransactionsId,
});

/** Soft-deleted rows (dismissed, or pending rows superseded by posted ones) never display. */
export const toActiveTransactions = (
  rows: TransactionRow[],
): TransactionEntity[] =>
  rows
    .filter((t) => !t.deleted)
    .map(toTransactionEntity)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

export const toCategoryEntity = (c: CategoryRow): CategoryEntity => ({
  id: c.id,
  name: c.name,
  type: isCategoryType(c.type) ? c.type : "Wants",
  plannedAmount: c.plannedAmount,
});
