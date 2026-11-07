import {
  BudgetEntity,
  CategoryType,
  CategoryWithTransactions,
  MonthView,
  TransactionEntity,
} from "./types";

/** Stitch the month's transactions onto their categories; the rest are uncategorized. */
export const buildMonthView = (
  budget: BudgetEntity,
  transactions: TransactionEntity[],
): MonthView => {
  const categoryIds = new Set(budget.categories.map((c) => c.id));
  const byCategory = new Map<string, TransactionEntity[]>();
  const uncategorized: TransactionEntity[] = [];
  for (const t of transactions) {
    // A transaction pointing at a category that's not in this budget (e.g. a
    // stale id from a deleted category) is shown as uncategorized rather than
    // silently vanishing.
    if (t.budgetCategoryId && categoryIds.has(t.budgetCategoryId)) {
      const list = byCategory.get(t.budgetCategoryId) ?? [];
      list.push(t);
      byCategory.set(t.budgetCategoryId, list);
    } else {
      uncategorized.push(t);
    }
  }
  const categories = budget.categories.map((c) => ({
    ...c,
    transactions: byCategory.get(c.id) ?? [],
  }));
  return { budget, categories, uncategorized };
};

/** A section's categories, alphabetical (case-insensitive). */
export const sectionCategories = <
  T extends { type: CategoryType; name: string },
>(
  categories: T[],
  type: CategoryType,
): T[] =>
  categories
    .filter((c) => c.type === type)
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

/** Net spending (positive) for a category; refunds reduce it. */
export const categorySpent = (c: CategoryWithTransactions): number =>
  c.transactions.reduce((sum, t) => sum + t.amount, 0);

/** Spent for expense sections, received (positive) for Income. */
export const categoryActual = (c: CategoryWithTransactions): number =>
  c.type === "Income" ? -categorySpent(c) : categorySpent(c);

export const sectionTotals = (categories: CategoryWithTransactions[]) => ({
  planned: categories.reduce((sum, c) => sum + c.plannedAmount, 0),
  actual: categories.reduce((sum, c) => sum + categoryActual(c), 0),
});

export const budgetSummary = (categories: CategoryWithTransactions[]) => {
  const income = categories.filter((c) => c.type === "Income");
  const expenses = categories.filter((c) => c.type !== "Income");
  const plannedIncome = sectionTotals(income).planned;
  const plannedExpenses = sectionTotals(expenses).planned;
  const spent = sectionTotals(expenses).actual;
  const ratio = plannedIncome > 0 ? spent / plannedIncome : spent > 0 ? 1 : 0;
  return {
    plannedIncome,
    plannedExpenses,
    spent,
    difference: plannedIncome - plannedExpenses,
    isBalanced: plannedIncome === plannedExpenses,
    isOverspent: spent > plannedIncome,
    progressPercent: Math.round(Math.min(Math.max(ratio, 0), 1) * 100),
  };
};
