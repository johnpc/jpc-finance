import { useState } from "react";
import { useTransactionMutations } from "./useTransactionMutations";
import { displayedName, normalizeDisplayName } from "../lib/transactionName";
import { TransactionEntity } from "../lib/types";

/** Local edit state + actions for the transaction details dialog. */
export function useTransactionDialog(
  transaction: TransactionEntity,
  onClose: () => void,
) {
  const { assign, rename, dismiss } = useTransactionMutations();
  const [name, setName] = useState(displayedName(transaction));

  const savedOverride = transaction.displayName ?? null;
  const isNameDirty =
    normalizeDisplayName(name, transaction.name) !== savedOverride;

  const saveName = () => {
    if (isNameDirty) rename.mutate({ transaction, newName: name });
  };

  const moveTo = (categoryId: string | null) => {
    saveName();
    assign.mutate({ id: transaction.id, categoryId });
    onClose();
  };

  const remove = () => {
    if (
      !window.confirm(
        `Delete "${displayedName(transaction)}"? It won't count toward any budget.`,
      )
    ) {
      return;
    }
    dismiss.mutate(transaction.id);
    onClose();
  };

  const close = () => {
    saveName();
    onClose();
  };

  return { name, setName, isNameDirty, saveName, moveTo, remove, close };
}
