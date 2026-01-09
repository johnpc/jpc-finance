import { TableCell, TableRow, useTheme } from "@aws-amplify/ui-react";
import { Delete } from "@mui/icons-material";
import { useDrop } from "react-dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { BudgetCategoryEntity, TransactionEntity } from "../../lib/types";
import { EditModal } from "../EditModal";

export default function BudgetTableCategoryRow({
  category,
  onClickCategory,
}: {
  category: BudgetCategoryEntity;
  onClickCategory: (c: BudgetCategoryEntity) => void;
}) {
  const { tokens } = useTheme();
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { withErrorHandling } = useErrorHandler();
  const [editingName, setEditingName] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TRANSACTION",
    drop: (item: { transaction: TransactionEntity }) => {
      withErrorHandling(async () => {
        await client.models.Transaction.update({
          id: item.transaction.id,
          budgetCategoryTransactionsId: category.id,
        });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budget"] });
      }, "Failed to categorize transaction");
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Name cannot be empty";
    if (name.length > 50) return "Name must be 50 characters or less";
    return null;
  };

  const validateAmount = (amount: string): string | null => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "Please enter a valid number";
    if (num < 0) return "Amount cannot be negative";
    if (num > 1000000) return "Amount must be less than $1,000,000";
    return null;
  };

  const updateName = async (name: string) => {
    await withErrorHandling(async () => {
      await client.models.BudgetCategory.update({ id: category.id, name });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      setEditingName(false);
    }, "Failed to update category name");
  };

  const updatePlannedAmount = async (amountString: string) => {
    await withErrorHandling(async () => {
      const amount = parseFloat(amountString);
      await client.models.BudgetCategory.update({
        id: category.id,
        plannedAmount: Math.round(amount * 100),
      });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      setEditingAmount(false);
    }, "Failed to update planned amount");
  };

  const removeCategory = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This will uncategorize ${category.transactions.length} transactions.`,
      )
    ) {
      return;
    }
    await withErrorHandling(async () => {
      await client.models.BudgetCategory.delete({ id: category.id });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    }, "Failed to delete category");
  };

  const planned = category.plannedAmount / 100;
  let total = category.transactions.reduce((acc, t) => t.amount / 100 + acc, 0);
  if (category.type === "Income") total = total * -1;

  let backgroundColor = "";
  if (total > planned - planned * 0.1)
    backgroundColor = tokens.colors.yellow[20].value;
  if (total > planned - planned * 0.01)
    backgroundColor = tokens.colors.green[20].value;
  if (total > planned) backgroundColor = tokens.colors.red[20].value;

  return (
    <>
      <TableRow
        ref={drop}
        style={{
          backgroundColor: isOver ? "rgba(0, 255, 0, 0.1)" : backgroundColor,
        }}
      >
        <TableCell onClick={() => setEditingName(true)}>
          {category.name}
        </TableCell>
        <TableCell onClick={() => setEditingAmount(true)}>
          ${planned.toFixed(2)}
        </TableCell>
        <TableCell onClick={() => onClickCategory(category)}>
          ${total.toFixed(2)}
        </TableCell>
        <TableCell onClick={removeCategory}>
          <Delete />
        </TableCell>
      </TableRow>

      {editingName && (
        <EditModal
          title="Edit Category Name"
          label="Category Name"
          initialValue={category.name}
          onSave={updateName}
          onCancel={() => setEditingName(false)}
          validate={validateName}
        />
      )}

      {editingAmount && (
        <EditModal
          title="Edit Planned Amount"
          label="Amount ($)"
          initialValue={planned.toString()}
          onSave={updatePlannedAmount}
          onCancel={() => setEditingAmount(false)}
          validate={validateAmount}
          type="number"
        />
      )}
    </>
  );
}
