// Centralized query key factory to ensure consistency and prevent duplicate requests
export const queryKeys = {
  budget: (date: Date) => ["budget", date.toISOString()] as const,
  budgets: () => ["budget"] as const,
  transactions: (date: Date) => ["transactions", date.toISOString()] as const,
  allTransactions: () => ["transactions"] as const,
  accounts: () => ["accounts"] as const,
  settings: () => ["settings"] as const,
} as const;
