import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import {
  BudgetEntity,
  BudgetCategoryEntity,
  TransactionEntity,
} from "../lib/types";

export function useBudget(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["budget", date.toISOString()],
    queryFn: async (): Promise<BudgetEntity | null> => {
      const budgetMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });
      const response = await client.models.Budget.listBudgetByBudgetMonth({
        budgetMonth,
        // @ts-expect-error - limit is supported at runtime but not in types
        limit: 10000,
      });
      console.log("Current user budgets:", response.data);

      if (!response.data?.length) return null;

      const budget = response.data[0];
      console.log("Fetching categories for budget:", budget.id);
      const categoriesResponse =
        await client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
          {
            budgetBudgetCategoriesId: budget.id,
            // @ts-expect-error - limit is supported at runtime but not in types
            limit: 10000,
          },
        );
      console.log("Categories response:", categoriesResponse.data);

      const budgetCategories = await Promise.all(
        categoriesResponse.data.map(
          async (category): Promise<BudgetCategoryEntity> => {
            const transactionsResponse =
              await client.models.Transaction.listTransactionByBudgetCategoryTransactionsId(
                {
                  budgetCategoryTransactionsId: category.id,
                  // @ts-expect-error - limit is supported at runtime but not in types
                  limit: 10000,
                },
              );

            const transactions: TransactionEntity[] =
              transactionsResponse.data.map((t) => ({
                ...t,
                amount: t.amount * -1,
                deleted: t.deleted ?? false,
                date: new Date(t.date),
                budgetCategoryId: t.budgetCategoryTransactionsId,
              }));

            return {
              ...category,
              type: category.type as "Saving" | "Needs" | "Wants" | "Income",
              transactions,
            };
          },
        ),
      );

      return { ...budget, budgetCategories };
    },
  });
}
