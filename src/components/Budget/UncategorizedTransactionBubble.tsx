import { useState } from "react";
import { CategorizeTransactionDialog } from "./CategorizeTransactionDialog";
import {
  BudgetCategoryEntity,
  TransactionEntity,
  updateTransaction,
} from "../../data/entity";
import { Badge } from "@aws-amplify/ui-react";
import { useDrag } from "react-dnd";
const DRAG_TYPE = "UNCATEGORIZED_TRANSACTION";

export default function UncategorizedTransactionBubble(props: {
  transaction: TransactionEntity;
  budgetCategories: BudgetCategoryEntity[];
}) {
  const [open, setOpen] = useState(false);
  const [collected, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { id: props.transaction.id, transaction: props.transaction },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value?: BudgetCategoryEntity) => {
    setOpen(false);
    if (value) {
      updateTransaction({ ...props.transaction, budgetCategoryId: value.id });
    }
  };

  return (
    <>
      <div
        ref={drag}
        style={{
          opacity: collected.isDragging ? 0.5 : 1,
          cursor: "move",
          touchAction: "none",
        }}
      >
        <Badge
          margin={"auto"}
          key={props.transaction.id}
          size="large"
          variation={props.transaction.amount > 0 ? "warning" : "success"}
          onClick={handleClickOpen}
        >
          {props.transaction.name}&nbsp;-&nbsp;$
          {(Math.abs(props.transaction.amount) / 100).toFixed(2)}
        </Badge>
        <CategorizeTransactionDialog
          open={open}
          onClose={handleClose}
          budgetCategories={props.budgetCategories}
        />
      </div>
    </>
  );
}
