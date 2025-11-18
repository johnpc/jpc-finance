import { TableCell, TableRow, useTheme } from "@aws-amplify/ui-react";
import { Delete } from "@mui/icons-material";
import { useDrop } from "react-dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { BudgetCategoryEntity, TransactionEntity } from "../../lib/types";

export default function BudgetTableCategoryRow({ category, onClickCategory }: { category: BudgetCategoryEntity; onClickCategory: (c: BudgetCategoryEntity) => void }) {
  const { tokens } = useTheme();
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TRANSACTION",
    drop: (item: { transaction: TransactionEntity }) => {
      client.models.Transaction.update({ id: item.transaction.id, budgetCategoryTransactionsId: category.id });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const updateName = async () => {
    const name = prompt("New name?");
    if (name) {
      await client.models.BudgetCategory.update({ id: category.id, name });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    }
  };

  const updatePlannedAmount = async () => {
    const plannedAmountString = prompt("New amount?");
    if (plannedAmountString) {
      await client.models.BudgetCategory.update({ id: category.id, plannedAmount: parseInt(plannedAmountString) * 100 });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    }
  };

  const removeCategory = async () => {
    await client.models.BudgetCategory.delete({ id: category.id });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  };

  const planned = category.plannedAmount / 100;
  let total = category.transactions.reduce((acc, t) => t.amount / 100 + acc, 0);
  if (category.type === "Income") total = total * -1;

  let backgroundColor = "";
  if (total > planned - planned * 0.1) backgroundColor = tokens.colors.yellow[20].value;
  if (total > planned - planned * 0.01) backgroundColor = tokens.colors.green[20].value;
  if (total > planned) backgroundColor = tokens.colors.red[20].value;

  return (
    <TableRow ref={drop} style={{ backgroundColor: isOver ? "rgba(0, 255, 0, 0.1)" : backgroundColor }}>
      <TableCell onClick={updateName}>{category.name}</TableCell>
      <TableCell onClick={updatePlannedAmount}>${planned.toFixed(2)}</TableCell>
      <TableCell onClick={() => onClickCategory(category)}>${total.toFixed(2)}</TableCell>
      <TableCell onClick={removeCategory}><Delete /></TableCell>
    </TableRow>
  );
}
