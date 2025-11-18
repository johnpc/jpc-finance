import { Divider, Table, TableBody, TableCell, TableHead, TableRow, Text, useTheme } from "@aws-amplify/ui-react";
import { Fragment } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { BudgetCategoryEntity, BudgetEntity } from "../../lib/types";
import BudgetTableCategoryRow from "./BudgetTableCategoryRow";

export default function BudgetTable({ budget, onClickCategory }: { budget: BudgetEntity; onClickCategory: (c: BudgetCategoryEntity) => void }) {
  const { tokens } = useTheme();
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  const incomeAmount = budget.budgetCategories.filter((c) => c.type === "Income").reduce((acc, c) => acc + c.plannedAmount, 0) / 100;

  const sections = [
    { title: "Income", subtitle: "Cash coming in" },
    { title: "Saving", subtitle: "Pay yourself first" },
    { title: "Needs", subtitle: "Pay your bills" },
    { title: "Wants", subtitle: "Treat yo self" },
  ];

  const createItem = async (type: "Saving" | "Needs" | "Wants" | "Income") => {
    const name = prompt("Name?");
    await client.models.BudgetCategory.create({ budgetBudgetCategoriesId: budget.id, type, name: name ?? "No name", plannedAmount: 0 });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  };

  return (
    <>
      {sections.map((section) => {
        const categories = budget.budgetCategories
          .filter((c) => c.type === section.title)
          .sort((a, b) => a.name.localeCompare(b.name));
        const sectionPlannedAmount = categories.reduce((acc, c) => acc + c.plannedAmount / 100, 0);
        const sectionSpentAmount = categories.reduce((acc, c) => acc + c.transactions.reduce((sum, t) => sum + t.amount, 0), 0) / 100;
        const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

        return (
          <Fragment key={section.title}>
            <Table highlightOnHover={false} caption={
              <>
                <Text as="div" fontSize={tokens.fontSizes.large} fontWeight="bold">{section.title}</Text>
                <Text>Spent {moneyFormatter.format(sectionSpentAmount)} ({((sectionSpentAmount * 100) / sectionPlannedAmount).toFixed(0)}% of planned)</Text>
                <Text marginBottom={tokens.space.small}>{section.subtitle} - {moneyFormatter.format(sectionPlannedAmount)} ({((sectionPlannedAmount / incomeAmount) * 100).toFixed(0)}%)</Text>
                <Divider marginBottom={tokens.space.xs} />
              </>
            }>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Name</TableCell>
                  <TableCell as="th">Planned</TableCell>
                  <TableCell as="th">Total</TableCell>
                  <TableCell as="th"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <BudgetTableCategoryRow key={category.id} category={category} onClickCategory={onClickCategory} />
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell colSpan={2} onClick={() => createItem(section.title as "Saving" | "Needs" | "Wants" | "Income")}>Create ➕</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        );
      })}
      <Divider style={{ marginBottom: "20px", marginTop: "20px" }} />
    </>
  );
}
