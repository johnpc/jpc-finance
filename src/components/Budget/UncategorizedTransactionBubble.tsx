import { useState } from "react";
import { CategorizeTransactionDialog } from "./CategorizeTransactionDialog";
import {
  BudgetCategoryEntity,
  TransactionEntity,
  updateTransaction,
} from "../../data/entity";
import { Badge } from "@aws-amplify/ui-react";

export default function UncategorizedTransactionBubble(props: {
  transaction: TransactionEntity;
  budgetCategories: BudgetCategoryEntity[];
}) {
  const [open, setOpen] = useState(false);
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
      <Badge
        margin={"auto"}
        key={props.transaction.id}
        size="large"
        variation="success"
        onClick={handleClickOpen}
      >
        {props.transaction.name}&nbsp;-&nbsp;$
        {(props.transaction.amount / 100).toFixed(2)}
      </Badge>
      <CategorizeTransactionDialog
        open={open}
        onClose={handleClose}
        budgetCategories={props.budgetCategories}
      />
    </>
  );
}
