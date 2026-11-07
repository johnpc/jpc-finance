import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useDate } from "./useDateHook";
import { useError } from "./useErrorHook";
import { useTransactions } from "./useTransactions";
import { queryKeys } from "../lib/queryKeys";
import { formatBudgetMonth, formatMonthYear } from "../lib/dateUtils";
import { throwOnErrors } from "../lib/amplify-types";

/** Uncategorize every transaction in the viewed month, to recategorize from scratch. */
export function useResetBudget() {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useError();
  const { date } = useDate();
  const { data: transactions = [] } = useTransactions(date);
  const categorized = transactions.filter((t) => t.budgetCategoryId);

  const mutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        categorized.map(async (t) =>
          throwOnErrors(
            await client.models.Transaction.update({
              id: t.id,
              budgetCategoryTransactionsId: null,
            }),
          ),
        ),
      );
      return categorized.length;
    },
    onSuccess: (count) =>
      showSuccess(
        `Moved ${count} transaction${count === 1 ? "" : "s"} back to uncategorized`,
      ),
    onError: (error) => showError(`Reset failed: ${error.message}`),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(formatBudgetMonth(date)),
      }),
  });

  const confirmReset = () => {
    const ok = window.confirm(
      `Move all ${categorized.length} categorized transactions in ${formatMonthYear(date)} back to Uncategorized?`,
    );
    if (ok) mutation.mutate();
  };

  return {
    confirmReset,
    isPending: mutation.isPending,
    categorizedCount: categorized.length,
    month: formatMonthYear(date),
  };
}
