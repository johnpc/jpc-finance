import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import {
  BudgetEntity,
  BudgetCategoryEntity,
  TransactionEntity,
} from "../lib/types";
import { queryKeys } from "../lib/queryKeys";

export function useBudget(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: queryKeys.budget(date),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    queryFn: async (): Promise<BudgetEntity | null> => {
      const budgetMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });

      // Fetch all budgets with pagination
      const allBudgets = [];
      let budgetNextToken: string | null | undefined = null;
      do {
        const budgetResponse =
          await client.models.Budget.listBudgetByBudgetMonth({
            budgetMonth,
            // @ts-expect-error - nextToken is supported at runtime but not in types
            nextToken: budgetNextToken,
          });
        allBudgets.push(...budgetResponse.data);
        budgetNextToken = budgetResponse.nextToken as string | null | undefined;
      } while (budgetNextToken);

      if (!allBudgets.length) return null;

      const budget = allBudgets[0];

      // Fetch all categories with pagination
      const allCategories = [];
      let categoryNextToken: string | null | undefined = null;
      do {
        const categoryResponse =
          await client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
            {
              budgetBudgetCategoriesId: budget.id,
              // @ts-expect-error - nextToken is supported at runtime but not in types
              nextToken: categoryNextToken,
            },
          );
        allCategories.push(...categoryResponse.data);
        categoryNextToken = categoryResponse.nextToken as
          | string
          | null
          | undefined;
      } while (categoryNextToken);

      // Fetch ALL transactions for the month at once (fixes N+1 problem)
      const transactionMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });
      const allTransactions = [];
      let transactionNextToken: string | null | undefined = null;
      do {
        const txResponse =
          await client.models.Transaction.listTransactionByTransactionMonth({
            transactionMonth,
            // @ts-expect-error - nextToken is supported at runtime but not in types
            nextToken: transactionNextToken,
          });
        allTransactions.push(...txResponse.data);
        transactionNextToken = txResponse.nextToken as
          | string
          | null
          | undefined;
      } while (transactionNextToken);

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
