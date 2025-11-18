import { Button, Card, Flex, Heading, Text } from "@aws-amplify/ui-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useDate } from "../../hooks/useDate";
import { useBudget } from "../../hooks/useBudget";
import { useSettings } from "../../hooks/useSettings";
import { useAuth } from "../../hooks/useAuth";
import { useTransactions } from "../../hooks/useTransactions";
import SyncTransactionsButton from "./SyncTransactionsButton";
import BudgetProgress from "./BudgetProgress";
import BudgetTable from "./BudgetTable";
import UncategorizedTransactions from "./UncategorizedTransactions";
import CategoryDetail from "./CategoryDetail";

export default function BudgetPage() {
  const { date } = useDate();
  const { data: budget, isLoading } = useBudget(date);
  const { data: settings } = useSettings();
  const { data: transactions = [] } = useTransactions(date);
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  console.log("Current authenticated user:", user);

  const selectedCategory = budget?.budgetCategories.find(c => c.id === selectedCategoryId);

  const createBudget = async () => {
    setCreating(true);
    const budgetMonth = date.toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" });
    
    const allBudgets = await client.models.Budget.list();
    const mostRecentBudget = allBudgets.data?.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const newBudget = await client.models.Budget.create({ budgetMonth });

    if (mostRecentBudget) {
      const categories = await client.models.BudgetCategory.list({
        filter: { budgetBudgetCategoriesId: { eq: mostRecentBudget.id } },
      });
      
      await Promise.all(
        categories.data.map((cat) =>
          client.models.BudgetCategory.create({
            budgetBudgetCategoriesId: newBudget.data!.id,
            name: cat.name,
            type: cat.type,
            plannedAmount: cat.plannedAmount,
          })
        )
      );
    }

    queryClient.invalidateQueries({ queryKey: ["budget"] });
    setCreating(false);
  };

  if (isLoading) return <Button disabled>Loading...</Button>;
  
  if (!budget) {
    const month = date.toLocaleString(undefined, { month: "long" });
    const year = date.getFullYear();
    
    return (
      <Card variation="outlined">
        <Flex direction="column" alignItems="center" gap="1rem" padding="3rem">
          <Heading level={4}>You haven't started your {month} {year} budget yet</Heading>
          <Text color="font.tertiary">Create a new budget to start tracking your expenses</Text>
          <Button onClick={createBudget} disabled={creating} variation="primary">
            {creating ? "Creating..." : "Create Budget"}
          </Button>
        </Flex>
      </Card>
    );
  }
  
  if (selectedCategory) return <CategoryDetail category={selectedCategory} onBack={() => setSelectedCategoryId(undefined)} />;

  return (
    <>
      <SyncTransactionsButton date={date} settings={settings} />
      <BudgetProgress budget={budget} />
      <BudgetTable budget={budget} onClickCategory={(c) => setSelectedCategoryId(c.id)} />
      <UncategorizedTransactions transactions={transactions} />
    </>
  );
}
