import { Card, Heading, Loader, Text, View, useTheme } from "@aws-amplify/ui-react";
import { BudgetEntity } from "../../lib/types";

export default function BudgetProgress({ budget }: { budget: BudgetEntity }) {
  const { tokens } = useTheme();

  const incomeCategory = budget.budgetCategories.filter((c) => c.type === "Income");
  const incomeAmount = incomeCategory.reduce((acc, c) => acc + c.plannedAmount, 0);

  const expenseAmount = budget.budgetCategories
    .filter((c) => c.type !== "Income")
    .reduce((acc, c) => c.plannedAmount + acc, 0);

  const transactionExpenseAmount = budget.budgetCategories
    .filter((c) => c.type !== "Income")
    .reduce((acc, c) => c.transactions.reduce((sum, t) => sum + t.amount, 0) + acc, 0);

  const isBalanced = incomeAmount === expenseAmount;

  return (
    <>
      <Card variation="elevated">
        {isBalanced ? (
          <View textAlign="center">
            <Heading>✅ Your budget is balanced</Heading>
          </View>
        ) : (
          <View textAlign="center">
            <Heading>❌ Your budget is not balanced.</Heading>
            <Text as="p">
              ${expenseAmount / 100} spent and ${incomeAmount / 100} earned
            </Text>
          </View>
        )}
      </Card>
      <Card>
        <View textAlign="center">
          <Text as="p">
            Spent ${(transactionExpenseAmount / 100).toFixed(2)} of ${(incomeAmount / 100).toFixed(2)}
          </Text>
        </View>
        <Loader
          filledColor={transactionExpenseAmount > incomeAmount ? tokens.colors.red[60] : tokens.colors.green[60]}
          variation="linear"
          percentage={(transactionExpenseAmount / incomeAmount) * 100}
          isDeterminate
          isPercentageTextHidden
        />
      </Card>
    </>
  );
}
