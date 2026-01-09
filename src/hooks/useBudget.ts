import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import {
  BudgetEntity,
  BudgetCategoryEntity,
  TransactionEntity,
} from "../lib/types";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages } from "../lib/amplify-types";
import { formatBudgetMonth } from "../lib/dateUtils";
import { CACHE_TIMES } from "../lib/constants";

export function useBudget(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: queryKeys.budget(date),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async (): Promise<BudgetEntity | null> => {
      const budgetMonth = formatBudgetMonth(date);

      // Fetch all budgets with pagination
      const allBudgets = await fetchAllPages({ budgetMonth }, (params) =>
        client.models.Budget.listBudgetByBudgetMonth(params),
      );

      if (!allBudgets.length) return null;

      const budget = allBudgets[0];

      // Fetch all categories with pagination
      const allCategories = await fetchAllPages(
        { budgetBudgetCategoriesId: budget.id },
        (params) =>
          client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
            params,
          ),
      );

      // Fetch ALL transactions for the month at once (fixes N+1 problem)
      const transactionMonth = formatBudgetMonth(date);
      const allTransactions = await fetchAllPages(
        { transactionMonth },
        (params) =>
          client.models.Transaction.listTransactionByTransactionMonth(params),
      );

      // Group transactions by category in memory
      const transactionsByCategory = new Map<string, TransactionEntity[]>();
      for (const t of allTransactions) {
        if (!t.budgetCategoryTransactionsId) continue;

        const transaction: TransactionEntity = {
          ...t,
          amount: t.amount * -1,
          deleted: t.deleted ?? false,
          date: new Date(t.date),
          budgetCategoryId: t.budgetCategoryTransactionsId,
        };

        if (!transactionsByCategory.has(t.budgetCategoryTransactionsId)) {
          transactionsByCategory.set(t.budgetCategoryTransactionsId, []);
        }
        transactionsByCategory
          .get(t.budgetCategoryTransactionsId)!
          .push(transaction);
      }

      // Map categories with their transactions
      const budgetCategories: BudgetCategoryEntity[] = allCategories.map(
        (category) => ({
          ...category,
          type: category.type as "Saving" | "Needs" | "Wants" | "Income",
          transactions: transactionsByCategory.get(category.id) || [],
        }),
      );

      return { ...budget, budgetCategories };
    },
  });
}
