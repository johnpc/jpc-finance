import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { BudgetEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages } from "../lib/amplify-types";
import { formatBudgetMonth } from "../lib/dateUtils";
import { toCategoryEntity } from "../lib/mappers";
import { CACHE_TIMES } from "../lib/constants";

/** The month's budget and its categories (transactions come from useTransactions). */
export function useBudget(date: Date) {
  const client = useAmplifyClient();
  const budgetMonth = formatBudgetMonth(date);

  return useQuery({
    queryKey: queryKeys.budget(budgetMonth),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async (): Promise<BudgetEntity | null> => {
      const budgets = await fetchAllPages({ budgetMonth }, (params) =>
        client.models.Budget.listBudgetByBudgetMonth(params),
      );
      const budget = budgets[0];
      if (!budget) return null;

      const categories = await fetchAllPages(
        { budgetBudgetCategoriesId: budget.id },
        (params) =>
          client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
            params,
          ),
      );
      return {
        id: budget.id,
        budgetMonth: budget.budgetMonth,
        categories: categories.map(toCategoryEntity),
      };
    },
  });
}
