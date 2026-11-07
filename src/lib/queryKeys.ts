// Keys are scoped by the "MM/yy" month string (not a Date's ISO string, which
// would mint a new cache entry for every `new Date()`).
export const queryKeys = {
  budget: (month: string) => ["budget", month] as const,
  budgets: () => ["budget"] as const,
  transactions: (month: string) => ["transactions", month] as const,
  allTransactions: () => ["transactions"] as const,
  accounts: () => ["accounts"] as const,
  plaidConnections: () => ["plaidConnections"] as const,
  plaidReauth: () => ["plaidReauth"] as const,
  syncHistory: () => ["syncHistory"] as const,
} as const;
