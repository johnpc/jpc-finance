import { parseBudgetMonth } from "./dateUtils";

type BudgetRow = { id: string; budgetMonth: string };
type CategorySeed = { name: string; type: string; plannedAmount: number };

/** The latest budget strictly before `budgetMonth`, if any. */
export const mostRecentBudgetBefore = <T extends BudgetRow>(
  budgets: T[],
  budgetMonth: string,
): T | undefined => {
  const target = parseBudgetMonth(budgetMonth).getTime();
  return budgets
    .filter((b) => parseBudgetMonth(b.budgetMonth).getTime() < target)
    .sort(
      (a, b) =>
        parseBudgetMonth(b.budgetMonth).getTime() -
        parseBudgetMonth(a.budgetMonth).getTime(),
    )[0];
};

export const STARTER_CATEGORIES: CategorySeed[] = [
  { name: "Paycheck", type: "Income", plannedAmount: 0 },
  { name: "Investing", type: "Saving", plannedAmount: 0 },
  { name: "Housing", type: "Needs", plannedAmount: 0 },
  { name: "Groceries", type: "Needs", plannedAmount: 0 },
  { name: "Transport", type: "Needs", plannedAmount: 0 },
  { name: "Entertainment", type: "Wants", plannedAmount: 0 },
  { name: "Dining Out", type: "Wants", plannedAmount: 0 },
  { name: "Shopping", type: "Wants", plannedAmount: 0 },
  { name: "Misc", type: "Wants", plannedAmount: 0 },
  { name: "Giving", type: "Wants", plannedAmount: 0 },
];

/** Copy the previous budget's categories, or start with the starter set. */
export const categoriesForNewBudget = (
  previous: CategorySeed[] | null,
): CategorySeed[] =>
  previous
    ? previous.map(({ name, type, plannedAmount }) => ({
        name,
        type,
        plannedAmount,
      }))
    : STARTER_CATEGORIES;
