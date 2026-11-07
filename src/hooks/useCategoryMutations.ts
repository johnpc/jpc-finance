import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useDate } from "./useDateHook";
import { useError } from "./useErrorHook";
import { queryKeys } from "../lib/queryKeys";
import { formatBudgetMonth } from "../lib/dateUtils";
import { throwOnErrors } from "../lib/amplify-types";
import { uncategorizeAll } from "../lib/transactionCache";
import {
  BudgetEntity,
  CategoryEntity,
  CategoryType,
  TransactionEntity,
} from "../lib/types";

type NewCategory = { name: string; type: CategoryType; plannedAmount: number };

/** Create, edit, and delete budget categories for the viewed month. */
export function useCategoryMutations() {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { date } = useDate();
  const month = formatBudgetMonth(date);
  const budgetKey = queryKeys.budget(month);
  const transactionsKey = queryKeys.transactions(month);

  const patchBudget = (
    fn: (categories: CategoryEntity[]) => CategoryEntity[],
  ) =>
    queryClient.setQueryData<BudgetEntity | null>(budgetKey, (old) =>
      old ? { ...old, categories: fn(old.categories) } : old,
    );

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: budgetKey });
    queryClient.invalidateQueries({ queryKey: transactionsKey });
  };

  const fail = (what: string) => (error: Error) => {
    showError(`${what}: ${error.message}`);
    refetch();
  };

  const create = useMutation({
    mutationFn: async (input: NewCategory) => {
      const budget = queryClient.getQueryData<BudgetEntity | null>(budgetKey);
      if (!budget) throw new Error("No budget for this month");
      throwOnErrors(
        await client.models.BudgetCategory.create({
          ...input,
          budgetBudgetCategoriesId: budget.id,
        }),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey }),
    onError: fail("Couldn't create the category"),
  });

  const update = useMutation({
    mutationFn: async (category: CategoryEntity) =>
      throwOnErrors(
        await client.models.BudgetCategory.update({
          id: category.id,
          name: category.name,
          plannedAmount: category.plannedAmount,
        }),
      ),
    onMutate: (category) =>
      patchBudget((list) =>
        list.map((c) => (c.id === category.id ? category : c)),
      ),
    onError: fail("Couldn't save the category"),
  });

  // Uncategorize the category's transactions before deleting it, so none are
  // left pointing at a category id that no longer exists.
  const remove = useMutation({
    mutationFn: async ({
      id,
      transactionIds,
    }: {
      id: string;
      transactionIds: string[];
    }) => {
      for (const transactionId of transactionIds) {
        throwOnErrors(
          await client.models.Transaction.update({
            id: transactionId,
            budgetCategoryTransactionsId: null,
          }),
        );
      }
      throwOnErrors(await client.models.BudgetCategory.delete({ id }));
    },
    onMutate: ({ id }) => {
      patchBudget((list) => list.filter((c) => c.id !== id));
      queryClient.setQueryData<TransactionEntity[]>(transactionsKey, (old) =>
        uncategorizeAll(old, id),
      );
    },
    onError: fail("Couldn't delete the category"),
  });

  return { create, update, remove };
}
