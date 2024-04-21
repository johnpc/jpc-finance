import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  BudgetEntity,
  TransactionEntity,
  createBudgetCategory,
  updateBudgetCategory,
} from "../../data/entity";

export default function BudgetTable(props: {
  budget: BudgetEntity;
  transactions: TransactionEntity[];
  onClickBudgetCategory: (category: BudgetCategoryEntity) => void;
}) {
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
      plannedAmount: (plannedAmount ?? 0) * 100,
    });
  };
  return (
    <>
      {sections.map((section) => {
        const categories = props.budget.budgetCategories.filter(
          (budgetCategory) => budgetCategory.type === section.title,
        );
        return (
          <Table
            highlightOnHover={false}
            caption={section.title}
            key={section.title}
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Planned</TableCell>
                <TableCell as="th">Spent</TableCell>
                <TableCell as="th">Txn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => {
                let spentTotal = category.transactions.reduce(
                  (acc, transaction) => transaction.amount + acc,
                  0,
                );
                if (category.type === "Income") {
                  spentTotal = spentTotal * -1;
                }
                const backgroundColor =
                  spentTotal > category.plannedAmount
                    ? "palevioletred"
                    : "palegoldenrod";
                return (
                  <TableRow key={category.id} style={{ backgroundColor }}>
                    <TableCell onClick={() => updateName(category)}>
                      {category.name}
                    </TableCell>
                    <TableCell onClick={() => updatePlannedAmount(category)}>
                      ${category.plannedAmount / 100}
                    </TableCell>
                    <TableCell>${spentTotal / 100}</TableCell>
                    <TableCell
                      onClick={() => props.onClickBudgetCategory(category)}
                    >
                      {category.transactions.length}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell
                  colSpan={2}
                  onClick={() =>
                    createItem(
                      section.title as "Saving" | "Needs" | "Wants" | "Income",
                    )
                  }
                >
                  Create ➕
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      })}
    </>
  );
}
