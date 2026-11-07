import {
  Card,
  Heading,
  Loader,
  Text,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { budgetSummary } from "../../lib/budgetMath";
import { formatMoney } from "../../lib/currency";
import { CategoryWithTransactions } from "../../lib/types";

export default function BudgetProgress({
  categories,
}: {
  categories: CategoryWithTransactions[];
}) {
  const { tokens } = useTheme();
  const s = budgetSummary(categories);

  return (
    <Card variation="elevated" marginBottom="1rem">
      <View textAlign="center">
        <Heading level={5}>
          {s.isBalanced ? "✅ Your budget is balanced" : "❌ Not balanced"}
        </Heading>
        {!s.isBalanced && (
          <Text fontSize="small" color="font.tertiary">
            {s.difference > 0
              ? `${formatMoney(s.difference)} of income isn't assigned yet`
              : `Your plan spends ${formatMoney(s.difference)} more than your income`}
          </Text>
        )}
        <Text marginTop="0.75rem">
          Spent {formatMoney(s.spent)} of {formatMoney(s.plannedIncome)}
        </Text>
      </View>
      <Loader
        variation="linear"
        isDeterminate
        isPercentageTextHidden
        percentage={s.progressPercent}
        filledColor={
          s.isOverspent ? tokens.colors.red[60] : tokens.colors.green[60]
        }
      />
    </Card>
  );
}
