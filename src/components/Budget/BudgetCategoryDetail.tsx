import { Button, Card, Heading, Text } from "@aws-amplify/ui-react";
import { BudgetCategoryEntity } from "../../data/entity";
import { BudgetCategoryDetailCard } from "./BudgetCategoryDetailCard";

export default function BudgetCategoryDetail(props: {
  budgetCategory: BudgetCategoryEntity;
  onLeaveBudgetCategory: () => void;
}) {
  return (
    <>
      <Heading>
        {props.budgetCategory.type} - {props.budgetCategory.name}
      </Heading>
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
