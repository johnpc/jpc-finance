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
import { SchemaBudgetCategory } from "../../lib/types";
import SyncTransactionsButton from "./SyncTransactionsButton";
import BudgetProgress from "./BudgetProgress";
import BudgetTable from "./BudgetTable";
import UncategorizedTransactions from "./UncategorizedTransactions";
import CategoryDetail from "./CategoryDetail";
import { useErrorHandler } from "../../hooks/useErrorHandler";

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
      const budgetMonth = date.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      });

      const allBudgets = await client.models.Budget.list();
      const mostRecentBudget = allBudgets.data?.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      const newBudget = await client.models.Budget.create({ budgetMonth });

      if (mostRecentBudget) {
        const allCategories: SchemaBudgetCategory[] = [];
        let nextToken: string | null | undefined = null;

        do {
          const result: {
            data: SchemaBudgetCategory[];
            nextToken?: string | null;
          } =
            await client.models.BudgetCategory.listBudgetCategoryByBudgetBudgetCategoriesId(
              {
                budgetBudgetCategoriesId: mostRecentBudget.id,
                // @ts-expect-error - nextToken is supported at runtime but not in types
                nextToken,
              },
            );
          allCategories.push(...result.data);
          nextToken = result.nextToken;
        } while (nextToken);

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
    const month = date.toLocaleString(undefined, { month: "long" });
    const year = date.getFullYear();

    return (
      <Card variation="outlined">
        <Flex direction="column" alignItems="center" gap="1rem" padding="3rem">
          <Heading level={4}>
            You haven't started your {month} {year} budget yet
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
