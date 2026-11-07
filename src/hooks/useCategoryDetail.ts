import { useCategoryForm } from "./useCategoryForm";
import { useCategoryMutations } from "./useCategoryMutations";
import { useSelection } from "./useSelection";
import { useTransactionMutations } from "./useTransactionMutations";
import { CategoryWithTransactions } from "../lib/types";

/** Edit a category's name/target, manage its transactions, or delete it. */
export function useCategoryDetail(
  category: CategoryWithTransactions,
  onBack: () => void,
) {
  const { update, remove } = useCategoryMutations();
  const { assign } = useTransactionMutations();
  const selection = useSelection(category.transactions);

  const form = useCategoryForm(category, (values) => {
    update.mutate({ ...category, ...values });
  });

  const deleteCategory = () => {
    const count = category.transactions.length;
    const moved = count
      ? ` Its ${count} transaction${count === 1 ? "" : "s"} will move back to Uncategorized.`
      : "";
    if (!window.confirm(`Delete "${category.name}"?${moved}`)) return;
    remove.mutate({
      id: category.id,
      transactionIds: category.transactions.map((t) => t.id),
    });
    onBack();
  };

  const uncategorize = (transactionId: string) =>
    assign.mutate({ id: transactionId, categoryId: null });

  return { form, selection, deleteCategory, uncategorize };
}
