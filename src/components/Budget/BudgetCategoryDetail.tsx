import { Button, Card, Heading, Text } from "@aws-amplify/ui-react";
import { BudgetCategoryEntity } from "../../data/entity";
import { BudgetCategoryDetailCard } from "./BudgetCategoryDetailCard";

export default function BudgetCategoryDetail(props: {
  budgetCategory: BudgetCategoryEntity;
  onLeaveBudgetCategory: () => void;
}) {
  const planned = props.budgetCategory.plannedAmount / 100;
  let total = props.budgetCategory.transactions.reduce(
    (acc, transaction) => transaction.amount / 100 + acc,
    0,
  );
  if (props.budgetCategory.type === "Income") {
    total = total * -1;
  }
  const remaining = planned - total;
  return (
    <>
      <Heading>
        {props.budgetCategory.type} - {props.budgetCategory.name}
      </Heading>
      <Text>
        <ul>
          <li>Planned: ${planned.toFixed(2)}.</li>
          <li>Total: ${total.toFixed(2)}.</li>
          <li>Remaining: ${remaining.toFixed(2)}.</li>
        </ul>
      </Text>
      <Card>
        <Text>{props.budgetCategory.transactions.length} transactions.</Text>
      </Card>
      {props.budgetCategory.transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((transaction) => (
          <BudgetCategoryDetailCard
            budgetCategory={props.budgetCategory}
            transaction={transaction}
          />
        ))}
      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => props.onLeaveBudgetCategory()}
      >
        Done
      </Button>
    </>
  );
}
