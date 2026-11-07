import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useDate } from "./useDateHook";
import { useError } from "./useErrorHook";
import { queryKeys } from "../lib/queryKeys";
import { formatBudgetMonth } from "../lib/dateUtils";
import { throwOnErrors } from "../lib/amplify-types";
import { normalizeDisplayName } from "../lib/transactionName";
import { patchTransaction, removeTransaction } from "../lib/transactionCache";
import { TransactionEntity } from "../lib/types";

type Cache = TransactionEntity[] | undefined;

/**
 * Assign, rename, and dismiss transactions. Every change is applied to the
 * month's transaction cache immediately and kept; a failure refetches to roll
 * back to the server's truth.
 */
export function useTransactionMutations() {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { date } = useDate();
  const key = queryKeys.transactions(formatBudgetMonth(date));

  const optimistic = <V>(
    run: (vars: V) => Promise<unknown>,
    apply: (cache: Cache, vars: V) => Cache,
    failure: string,
  ) => ({
    mutationFn: run,
    onMutate: async (vars: V) => {
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<TransactionEntity[]>(key, (old) =>
        apply(old, vars),
      );
    },
    onError: (error: Error) => {
      showError(`${failure}: ${error.message}`);
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const update = async (input: {
    id: string;
    budgetCategoryTransactionsId?: string | null;
    displayName?: string | null;
    deleted?: boolean;
  }) => throwOnErrors(await client.models.Transaction.update(input));

  const assign = useMutation(
    optimistic<{ id: string; categoryId: string | null }>(
      ({ id, categoryId }) =>
        update({ id, budgetCategoryTransactionsId: categoryId }),
      (cache, { id, categoryId }) =>
        patchTransaction(cache, id, { budgetCategoryId: categoryId }),
      "Couldn't move the transaction",
    ),
  );

  const rename = useMutation(
    optimistic<{ transaction: TransactionEntity; newName: string }>(
      ({ transaction, newName }) =>
        update({
          id: transaction.id,
          displayName: normalizeDisplayName(newName, transaction.name),
        }),
      (cache, { transaction, newName }) =>
        patchTransaction(cache, transaction.id, {
          displayName: normalizeDisplayName(newName, transaction.name),
        }),
      "Couldn't rename the transaction",
    ),
  );

  // Soft delete: the sync dedupe logic relies on the row still existing.
  const dismiss = useMutation(
    optimistic<string>(
      (id) => update({ id, deleted: true }),
      removeTransaction,
      "Couldn't delete the transaction",
    ),
  );

  return { assign, rename, dismiss };
}
