export const CATEGORY_TYPES = ["Income", "Saving", "Needs", "Wants"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

/**
 * A transaction in display sign convention: the backend stores money leaving
 * an account as a negative amount, the web flips it so spending is positive
 * and income/refunds are negative (cents).
 */
export type TransactionEntity = {
  id: string;
  amount: number;
  transactionMonth: string;
  date: Date;
  name: string;
  displayName?: string | null;
  pending: boolean;
  budgetCategoryId?: string | null;
};

export type AccountEntity = {
  id: string;
  name: string;
  institutionName: string;
  type: string;
  subType: string;
  lastFour?: number | null;
};

export type CategoryEntity = {
  id: string;
  name: string;
  type: CategoryType;
  plannedAmount: number;
};

export type CategoryWithTransactions = CategoryEntity & {
  transactions: TransactionEntity[];
};

export type BudgetEntity = {
  id: string;
  budgetMonth: string;
  categories: CategoryEntity[];
};

export type MonthView = {
  budget: BudgetEntity;
  categories: CategoryWithTransactions[];
  uncategorized: TransactionEntity[];
};

export type PlaidConnection = {
  id: string;
  accessToken: string;
  institutionName?: string | null;
  createdAt?: string | null;
};

export type SyncRunEntity = {
  id: string;
  source: string;
  startedAt: string;
  durationMs: number;
  newTransactionCount: number;
  error?: string | null;
};
