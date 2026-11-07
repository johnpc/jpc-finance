import { useDrop } from "react-dnd";
import { useTransactionMutations } from "./useTransactionMutations";
import { TRANSACTION_DRAG_TYPE, TransactionDragItem } from "../lib/dndConfig";

/** Make a category row accept dragged transactions. */
export function useCategoryDrop(categoryId: string) {
  const { assign } = useTransactionMutations();
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: TRANSACTION_DRAG_TYPE,
      drop: (item: TransactionDragItem) =>
        assign.mutate({ id: item.id, categoryId }),
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [categoryId, assign.mutate],
  );
  return { isOver, dropRef };
}
