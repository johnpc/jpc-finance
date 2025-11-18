import { Button, Card, Heading, Text, Flex } from "@aws-amplify/ui-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { BudgetCategoryEntity, TransactionEntity } from "../../lib/types";

function TransactionCard({ transaction, onRemove }: { transaction: TransactionEntity; onRemove: () => void }) {
  const amount = (transaction.amount / 100) * -1;
  
  return (
    <Card marginBottom="10px">
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="column" gap="5px">
          <Heading level={6}>
            {transaction.date.toLocaleDateString(undefined, { day: "numeric", month: "long" })}
          </Heading>
          <Text>{transaction.name}</Text>
          <Button size="small" variation="warning" onClick={onRemove}>
            Uncategorize
          </Button>
        </Flex>
        <Heading level={4} color={amount > 0 ? "green" : "red"}>
          ${Math.abs(amount).toFixed(2)}
        </Heading>
      </Flex>
    </Card>
  );
}

export default function CategoryDetail({ category, onBack }: { category: BudgetCategoryEntity; onBack: () => void }) {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  const planned = category.plannedAmount / 100;
  let total = category.transactions.reduce((acc, t) => t.amount / 100 + acc, 0);
  if (category.type === "Income") total = total * -1;
  const remaining = planned - total;

  const handleRemove = async (transaction: TransactionEntity) => {
    await client.models.Transaction.update({ id: transaction.id, budgetCategoryTransactionsId: null });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return (
    <>
      <Heading level={3}>{category.type} - {category.name}</Heading>
      <Card marginBottom="20px">
        <Text>Planned: ${planned.toFixed(2)}</Text>
        <Text>Total: ${total.toFixed(2)}</Text>
        <Text>Remaining: ${remaining.toFixed(2)}</Text>
        <Text>{category.transactions.length} transactions</Text>
      </Card>
      
      {category.transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} onRemove={() => handleRemove(transaction)} />
        ))}
      
      <Button isFullWidth variation="primary" onClick={onBack} marginTop="20px">
        Done
      </Button>
    </>
  );
}
