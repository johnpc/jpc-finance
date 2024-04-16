import {
  Card,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  View,
} from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  BudgetEntity,
  createBudgetCategory,
  updateBudgetCategory,
} from "../data/entity";
import UncategorizedTransactions from "./Budget/UncategorizedTransactions";

export default function BudgetPage(props: { budget: BudgetEntity }) {
  const sections = [
    { title: "Income", subtitle: "Cash coming in" },
    { title: "Saving", subtitle: "Pay yourself first" },
    { title: "Needs", subtitle: "Pay your bills" },
    { title: "Wants", subtitle: "Treat yo self" },
  ];

  const createItem = async (type: "Saving" | "Needs" | "Wants" | "Income") => {
    const name = prompt("Name?");
    await createBudgetCategory(props.budget, type, name ?? "No name");
  };

  const updateName = async (budgetCategory: BudgetCategoryEntity) => {
    const name = prompt("New name?");
    await updateBudgetCategory({
      ...budgetCategory,
      name: name ?? budgetCategory.name,
    });
  };

  const updatePlannedAmount = async (budgetCategory: BudgetCategoryEntity) => {
    const plannedAmountString = prompt("New amount?");
    const plannedAmount = parseInt(plannedAmountString!);
    await updateBudgetCategory({
      ...budgetCategory,
      plannedAmount: plannedAmount * 100 ?? budgetCategory.plannedAmount,
    });
  };

  const incomeAmount = props.budget.budgetCategories
    .filter((budgetCategory) => budgetCategory.type === "Income")
    .reduce((acc, incomeCategory) => incomeCategory.plannedAmount + acc, 0);

  const expenseAmount = props.budget.budgetCategories
    .filter((budgetCategory) => budgetCategory.type !== "Income")
    .reduce((acc, expenseCategory) => expenseCategory.plannedAmount + acc, 0);

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
      {sections.map((section) => {
        const categories = props.budget.budgetCategories.filter(
          (budgetCategory) => budgetCategory.type === section.title,
        );
        return (
          <Card variation="elevated" key={section.title}>
            <Table highlightOnHover={false} caption={section.title}>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Name</TableCell>
                  <TableCell as="th">Planned</TableCell>
                  <TableCell as="th">Spent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => {
                  const spentTotal = category.transactions.reduce(
                    (acc, transaction) => transaction.amount + acc,
                    0,
                  );
                  return (
                    <TableRow key={category.id}>
                      <TableCell onClick={() => updateName(category)}>
                        {category.name}
                      </TableCell>
                      <TableCell onClick={() => updatePlannedAmount(category)}>
                        ${category.plannedAmount / 100}
                      </TableCell>
                      <TableCell>${spentTotal / 100}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    as={"a"}
                    onClick={() =>
                      createItem(
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
          </Card>
        );
      })}
      <UncategorizedTransactions
        budgetCategories={props.budget.budgetCategories}
      />
    </>
  );
}
