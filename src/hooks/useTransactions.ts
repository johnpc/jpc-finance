import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { TransactionEntity } from "../lib/types";

export function useTransactions(date: Date) {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["transactions", date.toISOString()],
    queryFn: async (): Promise<TransactionEntity[]> => {
      const transactionMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });
      const response =
        await client.models.Transaction.listTransactionByTransactionMonth({
          transactionMonth,
          // @ts-expect-error - limit is supported at runtime but not in types
          limit: 10000,
        });

      return response.data.map((t) => ({
        ...t,
        amount: t.amount * -1,
        deleted: t.deleted ?? false,
        date: new Date(t.date),
        budgetCategoryId: t.budgetCategoryTransactionsId,
      }));
    },
  });
}
