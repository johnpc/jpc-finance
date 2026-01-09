import { TableCell, TableRow, useTheme } from "@aws-amplify/ui-react";
import { Delete } from "@mui/icons-material";
import { useDrop } from "react-dnd";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { BudgetCategoryEntity, TransactionEntity } from "../../lib/types";
import { EditModal } from "../EditModal";
import { queryKeys } from "../../lib/queryKeys";
import { toDollars, toCents } from "../../lib/currency";
import { validators } from "../../lib/validation";

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
      categorizeMutation.mutate({
        transactionId: item.transaction.id,
        categoryId: category.id,
      });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const categorizeMutation = useMutation({
    mutationFn: async ({
      transactionId,
      categoryId,
    }: {
      transactionId: string;
      categoryId: string;
    }) => {
      await client.models.Transaction.update({
        id: transactionId,
        budgetCategoryTransactionsId: categoryId,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.allTransactions(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
    },
    onError: (error) => {
      withErrorHandling(
        () => Promise.reject(error),
        "Failed to categorize transaction",
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      await client.models.BudgetCategory.update({ id: category.id, name });
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      queryClient.setQueryData(
        queryKeys.budgets(),
        (old: BudgetCategoryEntity[] | undefined) =>
          old?.map((c) => (c.id === category.id ? { ...c, name } : c)),
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      setEditingName(false);
    },
    onError: (error, _name, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      withErrorHandling(
        () => Promise.reject(error),
        "Failed to update category name",
      );
    },
  });

  const updateAmountMutation = useMutation({
    mutationFn: async (amountString: string) => {
      const amount = parseFloat(amountString);
      await client.models.BudgetCategory.update({
        id: category.id,
        plannedAmount: toCents(amount),
      });
    },
    onMutate: async (amountString) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      const plannedAmount = toCents(parseFloat(amountString));
      queryClient.setQueryData(
        queryKeys.budgets(),
        (old: BudgetCategoryEntity[] | undefined) =>
          old?.map((c) => (c.id === category.id ? { ...c, plannedAmount } : c)),
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      setEditingAmount(false);
    },
    onError: (error, _amount, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      withErrorHandling(
        () => Promise.reject(error),
        "Failed to update planned amount",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await client.models.BudgetCategory.delete({ id: category.id });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      queryClient.setQueryData(
        queryKeys.budgets(),
        (old: BudgetCategoryEntity[] | undefined) =>
          old?.filter((c) => c.id !== category.id),
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      withErrorHandling(
        () => Promise.reject(error),
        "Failed to delete category",
      );
    },
  });

  const validateName = useCallback(
    (name: string): string | null =>
      validators.categoryName(name).error || null,
    [],
  );

  const validateAmount = useCallback(
    (amount: string): string | null => validators.amount(amount).error || null,
    [],
  );

  const updateName = useCallback(
    async (name: string) => {
      updateNameMutation.mutate(name);
    },
    [updateNameMutation],
  );

  const updatePlannedAmount = useCallback(
    async (amountString: string) => {
      updateAmountMutation.mutate(amountString);
    },
    [updateAmountMutation],
  );

  const removeCategory = useCallback(async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This will uncategorize ${category.transactions.length} transactions.`,
      )
    ) {
      return;
    }
    deleteMutation.mutate();
  }, [category.name, category.transactions.length, deleteMutation]);

  const { planned, total, backgroundColor } = useMemo(() => {
    const planned = toDollars(category.plannedAmount);
    let total = category.transactions.reduce(
      (acc, t) => toDollars(t.amount) + acc,
      0,
    );
    if (category.type === "Income") total = total * -1;

    let backgroundColor = "";
    if (total > planned - planned * 0.1)
      backgroundColor = tokens.colors.yellow[20].value;
    if (total > planned - planned * 0.01)
      backgroundColor = tokens.colors.green[20].value;
    if (total > planned) backgroundColor = tokens.colors.red[20].value;

    return { planned, total, backgroundColor };
  }, [
    category.plannedAmount,
    category.transactions,
    category.type,
    tokens.colors,
  ]);

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
        <TableCell>
          <button
            onClick={removeCategory}
            aria-label={`Delete ${category.name} category`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Delete />
          </button>
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
