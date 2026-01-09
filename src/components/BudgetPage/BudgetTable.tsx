import { queryKeys } from "../../lib/queryKeys";
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { Fragment, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { BudgetCategoryEntity } from "../../lib/types";
import BudgetTableCategoryRow from "./BudgetTableCategoryRow";
import { toDollars } from "../../lib/currency";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useDate } from "../../hooks/useDateHook";
import { useBudget } from "../../hooks/useBudget";
import { EditModal } from "../EditModal";
import { validators } from "../../lib/validation";

export default function BudgetTable({
  onClickCategory,
}: {
  onClickCategory: (c: BudgetCategoryEntity) => void;
}) {
  const { tokens } = useTheme();
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { withErrorHandling } = useErrorHandler();
  const { date } = useDate();
  const { data: budget } = useBudget(date);
  const [creatingType, setCreatingType] = useState<
    "Saving" | "Needs" | "Wants" | "Income" | null
  >(null);

  if (!budget) return null;

  const incomeAmount = budget.budgetCategories
    .filter((c) => c.type === "Income")
    .reduce((acc, c) => acc + c.plannedAmount, 0);
  const incomeAmountDollars = toDollars(incomeAmount);

  const sections = [
    { title: "Income", subtitle: "Cash coming in" },
    { title: "Saving", subtitle: "Pay yourself first" },
    { title: "Needs", subtitle: "Pay your bills" },
    { title: "Wants", subtitle: "Treat yo self" },
  ];

  const createItem = async (name: string) => {
    if (!creatingType) return;
    await withErrorHandling(async () => {
      await client.models.BudgetCategory.create({
        budgetBudgetCategoriesId: budget.id,
        type: creatingType,
        name,
        plannedAmount: 0,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      setCreatingType(null);
    }, "Failed to create category");
  };

  return (
    <>
      {sections.map((section) => {
        const categories = budget.budgetCategories
          .filter((c) => c.type === section.title)
          .sort((a, b) => a.name.localeCompare(b.name));
        const sectionPlannedAmount = categories.reduce(
          (acc, c) => acc + toDollars(c.plannedAmount),
          0,
        );
        const sectionSpentAmount = categories.reduce(
          (acc, c) =>
            acc + c.transactions.reduce((sum, t) => sum + t.amount, 0),
          0,
        );
        const sectionSpentAmountDollars = toDollars(sectionSpentAmount);
        const moneyFormatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });

        return (
          <Fragment key={section.title}>
            <Table
              highlightOnHover={false}
              caption={
                <>
                  <Text
                    as="div"
                    fontSize={tokens.fontSizes.large}
                    fontWeight="bold"
                  >
                    {section.title}
                  </Text>
                  <Text>
                    Spent {moneyFormatter.format(sectionSpentAmountDollars)} (
                    {(
                      (sectionSpentAmountDollars * 100) /
                      sectionPlannedAmount
                    ).toFixed(0)}
                    % of planned)
                  </Text>
                  <Text marginBottom={tokens.space.small}>
                    {section.subtitle} -{" "}
                    {moneyFormatter.format(sectionPlannedAmount)} (
                    {(
                      (sectionPlannedAmount / incomeAmountDollars) *
                      100
                    ).toFixed(0)}
                    %)
                  </Text>
                  <Divider marginBottom={tokens.space.xs} />
                </>
              }
            >
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
                  <BudgetTableCategoryRow
                    key={category.id}
                    category={category}
                    onClickCategory={onClickCategory}
                  />
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    colSpan={2}
                    onClick={() =>
                      setCreatingType(
                        section.title as
                          | "Saving"
                          | "Needs"
                          | "Wants"
                          | "Income",
                      )
                    }
                  >
                    Create ➕
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        );
      })}
      <Divider style={{ marginBottom: "20px", marginTop: "20px" }} />
      {creatingType && (
        <EditModal
          title={`Create ${creatingType} Category`}
          label="Category Name"
          initialValue=""
          onSave={createItem}
          onCancel={() => setCreatingType(null)}
          validate={(name) => validators.categoryName(name).error || null}
        />
      )}
    </>
  );
}
