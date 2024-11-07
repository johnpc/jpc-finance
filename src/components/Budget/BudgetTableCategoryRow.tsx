import { TableCell, TableRow, useTheme } from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  removeBudgetCategory,
  TransactionEntity,
  updateTransaction,
} from "../../data/entity";
import { Fragment } from "react";
import { Delete } from "@mui/icons-material";
import { useDrop } from "react-dnd";

export default function BudgetTableCategoryRow(props: {
  category: BudgetCategoryEntity;
  updateName: (category: BudgetCategoryEntity) => void;
  preferRemaining: boolean;
  onClickBudgetCategory: (category: BudgetCategoryEntity) => void;
  updatePlannedAmount: (category: BudgetCategoryEntity) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "UNCATEGORIZED_TRANSACTION", // This should match the drag type we set earlier
    drop: (item: { id: string; transaction: TransactionEntity }) => {
      updateTransaction({ ...item.transaction, budgetCategoryId: category.id });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  const { tokens } = useTheme();
  const {
    category,
    updateName,
    preferRemaining,
    onClickBudgetCategory,
    updatePlannedAmount,
  } = props;

  const planned = category.plannedAmount / 100;
  let total = category.transactions.reduce(
    (acc, transaction) => transaction.amount / 100 + acc,
    0,
  );
  if (category.type === "Income") {
    total = total * -1;
  }
  const remaining = planned - total;
  let backgroundColor = "";
  if (total > planned - planned * 0.1)
    backgroundColor = tokens.colors.yellow[20].value;
  if (total > planned - planned * 0.01)
    backgroundColor = tokens.colors.green[20].value;
  if (total > planned) backgroundColor = tokens.colors.red[20].value;
  return (
    <TableRow
      ref={drop}
      key={category.id}
      style={{
        backgroundColor: isOver ? "rgba(0, 255, 0, 0.1)" : backgroundColor,
      }}
    >
      <TableCell onClick={() => updateName(category)}>
        {category.name}
      </TableCell>
      {preferRemaining ? (
        <TableCell onClick={() => onClickBudgetCategory(category)}>
          ${remaining.toFixed(2)}
        </TableCell>
      ) : (
        <Fragment>
          <TableCell onClick={() => updatePlannedAmount(category)}>
            ${planned.toFixed(2)}
          </TableCell>
          <TableCell onClick={() => onClickBudgetCategory(category)}>
            ${total.toFixed(2)}
          </TableCell>
        </Fragment>
      )}
      <TableCell onClick={() => removeBudgetCategory(category)}>
        <Delete />
      </TableCell>
    </TableRow>
  );
}
