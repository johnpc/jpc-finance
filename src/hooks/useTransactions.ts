import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { TransactionEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages } from "../lib/amplify-types";
import { formatBudgetMonth } from "../lib/dateUtils";
import { toActiveTransactions } from "../lib/mappers";
import { CACHE_TIMES } from "../lib/constants";

/** Every live (non-deleted) transaction in the month, newest first. */
export function useTransactions(date: Date) {
  const client = useAmplifyClient();
  const transactionMonth = formatBudgetMonth(date);

  return useQuery({
    queryKey: queryKeys.transactions(transactionMonth),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async (): Promise<TransactionEntity[]> => {
      const rows = await fetchAllPages({ transactionMonth }, (params) =>
        client.models.Transaction.listTransactionByTransactionMonth(params),
      );
      return toActiveTransactions(rows);
    },
  });
}
