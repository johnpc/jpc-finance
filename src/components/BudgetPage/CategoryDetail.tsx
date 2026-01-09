import { queryKeys } from "../../lib/queryKeys";
import {
  Button,
  Card,
  Heading,
  Text,
  Flex,
  Loader,
} from "@aws-amplify/ui-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { BudgetCategoryEntity, TransactionEntity } from "../../lib/types";
import { toDollars } from "../../lib/currency";

function TransactionCard({
  transaction,
  onRemove,
  isRemoving,
}: {
  transaction: TransactionEntity;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const amount = toDollars(transaction.amount) * -1;

  return (
    <Card marginBottom="10px">
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="column" gap="5px">
          <Heading level={6}>
            {transaction.date.toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
            })}
          </Heading>
          <Text>{transaction.name}</Text>
          <Button
            size="small"
            variation="warning"
            onClick={onRemove}
            disabled={isRemoving}
          >
            {isRemoving ? <Loader size="small" /> : "Uncategorize"}
          </Button>
        </Flex>
        <Heading level={4} color={amount > 0 ? "green" : "red"}>
          ${Math.abs(amount).toFixed(2)}
        </Heading>
      </Flex>
    </Card>
  );
}

export default function CategoryDetail({
  category,
  onBack,
}: {
  category: BudgetCategoryEntity;
  onBack: () => void;
}) {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { withErrorHandling } = useErrorHandler();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const uncategorizeMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      await client.models.Transaction.update({
        id: transactionId,
        budgetCategoryTransactionsId: null,
      });
    },
    onMutate: async (transactionId) => {
      setRemovingId(transactionId);
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.allTransactions(),
      });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      setRemovingId(null);
    },
    onError: (error, _transactionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      withErrorHandling(
        () => Promise.reject(error),
        "Failed to uncategorize transaction",
      );
      setRemovingId(null);
    },
  });

  const planned = toDollars(category.plannedAmount);
  let total = category.transactions.reduce(
    (acc, t) => toDollars(t.amount) + acc,
    0,
  );
  if (category.type === "Income") total = total * -1;
  const remaining = planned - total;

  const handleRemove = async (transaction: TransactionEntity) => {
    uncategorizeMutation.mutate(transaction.id);
  };

  return (
    <>
      <Heading level={3}>
        {category.type} - {category.name}
      </Heading>
      <Card marginBottom="20px">
        <Text>Planned: ${planned.toFixed(2)}</Text>
        <Text>Total: ${total.toFixed(2)}</Text>
        <Text>Remaining: ${remaining.toFixed(2)}</Text>
        <Text>{category.transactions.length} transactions</Text>
      </Card>

      {category.transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onRemove={() => handleRemove(transaction)}
            isRemoving={removingId === transaction.id}
          />
        ))}

      <Button isFullWidth variation="primary" onClick={onBack} marginTop="20px">
        Done
      </Button>
    </>
  );
}
