import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { TransactionEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";

export function useTransactions(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: queryKeys.transactions(date),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    queryFn: async (): Promise<TransactionEntity[]> => {
      const transactionMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });

      // Fetch all transactions with pagination
      const allTransactions = [];
      let nextToken: string | null | undefined = null;
      do {
        const txResponse =
          await client.models.Transaction.listTransactionByTransactionMonth({
            transactionMonth,
            // @ts-expect-error - nextToken is supported at runtime but not in types
            nextToken,
          });
        allTransactions.push(...txResponse.data);
        nextToken = txResponse.nextToken as string | null | undefined;
      } while (nextToken);

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
