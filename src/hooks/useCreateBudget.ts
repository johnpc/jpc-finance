import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useDate } from "./useDateHook";
import { useError } from "./useErrorHook";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages, throwOnErrors } from "../lib/amplify-types";
import { formatBudgetMonth } from "../lib/dateUtils";
import {
  categoriesForNewBudget,
  mostRecentBudgetBefore,
} from "../lib/newBudget";

/**
 * Start the viewed month's budget by copying the categories (and targets) of
 * the most recent earlier budget, or a starter set for a first-time user.
 */
export function useCreateBudget() {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { date } = useDate();
  const budgetMonth = formatBudgetMonth(date);

  return useMutation({
    mutationFn: async () => {
      const budgets = await fetchAllPages({}, (params) =>
        client.models.Budget.list(params),
      );
      const previous = mostRecentBudgetBefore(budgets, budgetMonth);
      const previousCategories = previous
        ? await fetchAllPages(
            { budgetBudgetCategoriesId: previous.id },
            (params) =>
              client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
                params,
              ),
          )
        : null;

      const created = throwOnErrors(
        await client.models.Budget.create({ budgetMonth }),
      );
      const budgetId = created.data?.id;
      if (!budgetId) throw new Error("Budget was not created");

      await Promise.all(
        categoriesForNewBudget(previousCategories).map(async (c) =>
          throwOnErrors(
            await client.models.BudgetCategory.create({
              ...c,
              budgetBudgetCategoriesId: budgetId,
            }),
          ),
        ),
      );
    },
    onError: (error) =>
      showError(`Couldn't create the budget: ${error.message}`),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.budget(budgetMonth),
      }),
  });
}
