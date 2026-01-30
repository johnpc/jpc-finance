import { queryKeys } from "../../lib/queryKeys";
import {
  Button,
  Card,
  Flex,
  Heading,
  Placeholder,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from "@aws-amplify/ui-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useDate } from "../../hooks/useDateHook";
import { useBudget } from "../../hooks/useBudget";
import SyncTransactionsButton from "./SyncTransactionsButton";
import BudgetProgress from "./BudgetProgress";
import BudgetTable from "./BudgetTable";
import UncategorizedTransactions from "./UncategorizedTransactions";
import CategoryDetail from "./CategoryDetail";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { fetchAllPages } from "../../lib/amplify-types";
import { formatBudgetMonth, formatMonthYear } from "../../lib/dateUtils";

export default function BudgetPage() {
  const { date } = useDate();
  const { data: budget, isLoading } = useBudget(date);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { withErrorHandling } = useErrorHandler();

  const selectedCategory = budget?.budgetCategories.find(
    (c) => c.id === selectedCategoryId,
  );

  const createBudget = async () => {
    setCreating(true);
    await withErrorHandling(async () => {
      const budgetMonth = formatBudgetMonth(date);

      const allBudgets = await client.models.Budget.list();
      const parseBudgetMonth = (bm: string) => {
        const [month, year] = bm.split("/").map(Number);
        return new Date(2000 + year, month - 1);
      };
      const targetDate = parseBudgetMonth(budgetMonth);
      const previousBudgets = allBudgets.data?.filter(
        (b) => parseBudgetMonth(b.budgetMonth) < targetDate,
      );
      const mostRecentBudget = previousBudgets?.sort(
        (a, b) =>
          parseBudgetMonth(b.budgetMonth).getTime() -
          parseBudgetMonth(a.budgetMonth).getTime(),
      )[0];

      const newBudget = await client.models.Budget.create({ budgetMonth });

      if (mostRecentBudget) {
        const allCategories = await fetchAllPages(
          { budgetBudgetCategoriesId: mostRecentBudget.id },
          (params) =>
            client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
              params,
            ),
        );

        await Promise.all(
          allCategories.map((cat) =>
            client.models.BudgetCategory.create({
              budgetBudgetCategoriesId: newBudget.data!.id,
              name: cat.name,
              type: cat.type,
              plannedAmount: cat.plannedAmount,
            }),
          ),
        );
      } else {
        // Create default categories for first-time users
        const defaultCategories = [
          { name: "Paycheck", type: "Income" },
          { name: "Investing", type: "Saving" },
          { name: "Housing", type: "Needs" },
          { name: "Groceries", type: "Needs" },
          { name: "Transport", type: "Needs" },
          { name: "Entertainment", type: "Wants" },
          { name: "Dining Out", type: "Wants" },
          { name: "Shopping", type: "Wants" },
          { name: "Misc", type: "Wants" },
          { name: "Giving", type: "Wants" },
        ];

        await Promise.all(
          defaultCategories.map((cat) =>
            client.models.BudgetCategory.create({
              budgetBudgetCategoriesId: newBudget.data!.id,
              name: cat.name,
              type: cat.type as "Income" | "Saving" | "Needs" | "Wants",
              plannedAmount: 0,
            }),
          ),
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
    }, "Failed to create budget");
    setCreating(false);
  };

  if (isLoading) {
    return (
      <>
        <Card variation="outlined" marginBottom="1rem">
          <Flex direction="column" gap="0.5rem">
            <Placeholder height="2rem" />
            <Placeholder height="1.5rem" width="60%" />
          </Flex>
        </Card>
        <Card variation="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell as="th">Category</TableCell>
                <TableCell as="th">Planned</TableCell>
                <TableCell as="th">Spent</TableCell>
                <TableCell as="th"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Placeholder height="1.5rem" />
                  </TableCell>
                  <TableCell>
                    <Placeholder height="1.5rem" width="4rem" />
                  </TableCell>
                  <TableCell>
                    <Placeholder height="1.5rem" width="4rem" />
                  </TableCell>
                  <TableCell>
                    <Placeholder height="1.5rem" width="2rem" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </>
    );
  }

  if (!budget) {
    const monthYear = formatMonthYear(date);

    return (
      <Card variation="outlined">
        <Flex direction="column" alignItems="center" gap="1rem" padding="3rem">
          <Heading level={4}>
            You haven't started your {monthYear} budget yet
          </Heading>
          <Text color="font.tertiary">
            Create a new budget to start tracking your expenses
          </Text>
          <Button
            onClick={createBudget}
            disabled={creating}
            variation="primary"
          >
            {creating ? "Creating..." : "Create Budget"}
          </Button>
        </Flex>
      </Card>
    );
  }

  if (selectedCategory)
    return (
      <CategoryDetail
        category={selectedCategory}
        onBack={() => setSelectedCategoryId(undefined)}
      />
    );

  return (
    <>
      <SyncTransactionsButton />
      <BudgetProgress />
      <BudgetTable onClickCategory={(c) => setSelectedCategoryId(c.id)} />
      <UncategorizedTransactions />
    </>
  );
}
