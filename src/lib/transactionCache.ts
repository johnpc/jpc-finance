import { TransactionEntity } from "./types";

// Pure transforms over the month's transaction list, used for optimistic
// updates. The transactions query is the single source of truth for which
// category a transaction belongs to; the budget view is derived from it.

type Patch = Partial<
  Pick<TransactionEntity, "budgetCategoryId" | "displayName">
>;

export const patchTransaction = (
  list: TransactionEntity[] | undefined,
  id: string,
  patch: Patch,
): TransactionEntity[] | undefined =>
  list?.map((t) => (t.id === id ? { ...t, ...patch } : t));

export const removeTransaction = (
  list: TransactionEntity[] | undefined,
  id: string,
): TransactionEntity[] | undefined => list?.filter((t) => t.id !== id);

export const uncategorizeAll = (
  list: TransactionEntity[] | undefined,
  categoryId: string,
): TransactionEntity[] | undefined =>
  list?.map((t) =>
    t.budgetCategoryId === categoryId ? { ...t, budgetCategoryId: null } : t,
  );
