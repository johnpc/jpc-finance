import { Card, Heading, Loader, Text, View } from "@aws-amplify/ui-react";
import { BudgetEntity, TransactionEntity } from "../../data/entity";

export default function BudgetProgress(props: {
  budget: BudgetEntity;
  transactions: TransactionEntity[];
}) {
  const incomeCategory = props.budget.budgetCategories.find(
    (budgetCategory) => budgetCategory.type === "Income",
  )!;
  const incomeAmount = incomeCategory.plannedAmount;

  const expenseAmount = props.budget.budgetCategories
    .filter((budgetCategory) => budgetCategory.type !== "Income")
    .reduce((acc, expenseCategory) => expenseCategory.plannedAmount + acc, 0);

  const transactionExpenseAmount = props.transactions.reduce(
    (acc, transaction) => {
      if (
        !transaction.budgetCategoryId ||
        transaction.budgetCategoryId === incomeCategory.id
      )
        return acc;
      return transaction.amount + acc;
    },
    0,
  );
  const isBalanced = incomeAmount === expenseAmount;
  return (
    <>
      <Card variation="elevated">
        {isBalanced ? (
          <View textAlign={"center"}>
            <Heading>✅ Your budget is balanced</Heading>
          </View>
        ) : (
          <View textAlign={"center"}>
            <Heading>❌ Your budget is not balanced.</Heading>
            <Text as={"p"}>
              {" "}
              ${expenseAmount / 100} spent and ${incomeAmount / 100} earned
            </Text>
          </View>
        )}
      </Card>
      <Card>
        <View textAlign={"center"}>
          <Text as={"p"}>
            Spent ${(transactionExpenseAmount / 100).toFixed(2)} of $
            {(incomeAmount / 100).toFixed(2)}
          </Text>
        </View>
        <Loader
          variation="linear"
          percentage={(transactionExpenseAmount / incomeAmount) * 100}
          isDeterminate
          isPercentageTextHidden
        />
      </Card>
    </>
  );
}
