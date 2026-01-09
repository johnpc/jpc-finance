import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { TransactionEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages } from "../lib/amplify-types";
import { formatBudgetMonth } from "../lib/dateUtils";
import { CACHE_TIMES } from "../lib/constants";

export function useTransactions(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: queryKeys.transactions(date),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async (): Promise<TransactionEntity[]> => {
      const transactionMonth = formatBudgetMonth(date);

      // Fetch all transactions with pagination
      const allTransactions = await fetchAllPages(
        { transactionMonth },
        (params) =>
          client.models.Transaction.listTransactionByTransactionMonth(params),
      );

      return allTransactions.map((t) => ({
        ...t,
        amount: t.amount * -1,
        deleted: t.deleted ?? false,
        date: new Date(t.date),
        budgetCategoryId: t.budgetCategoryTransactionsId,
      }));
    },
  });
}
