import {
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  BudgetEntity,
  TransactionEntity,
  createBudgetCategory,
  removeBudgetCategory,
  updateBudgetCategory,
} from "../../data/entity";
import {Fragment, useState} from "react";

export default function BudgetTable(props: {
  budget: BudgetEntity;
  transactions: TransactionEntity[];
  onClickBudgetCategory: (category: BudgetCategoryEntity) => void;
}) {
  const {tokens} = useTheme();
  const [preferRemaining, setPreferRemaining] = useState<boolean>(false);

  const sections = [
    {title: "Income", subtitle: "Cash coming in"},
    {title: "Saving", subtitle: "Pay yourself first"},
    {title: "Needs", subtitle: "Pay your bills"},
    {title: "Wants", subtitle: "Treat yo self"},
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

  const togglePreferRemaining = () => {
    setPreferRemaining(!preferRemaining);
  };

  return (
    <>
      {sections.map((section) => {
        const categories = props.budget.budgetCategories.filter(
          (budgetCategory) => budgetCategory.type === section.title
        );
        return (
          <Fragment>
            <Table
              highlightOnHover={false}
              caption={section.title}
              key={section.title}
            >
              <TableHead>
                <TableRow>
                  <TableCell as="th">Name</TableCell>
                  {preferRemaining ? (
                    <TableCell as="th">Remaining</TableCell>
                  ) : (
                    <Fragment>
                      <TableCell as="th">Planned</TableCell>
                      <TableCell as="th">Spent</TableCell>
                    </Fragment>
                  )}
                  <TableCell as="th"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => {
                  const planned = category.plannedAmount / 100;
                  let total = category.transactions.reduce(
                    (acc, transaction) => transaction.amount / 100 + acc,
                    0
                  );
                  if (category.type === "Income") {
                    total = total * -1;
                  }
                  const remaining = planned - total;
                  const backgroundColor =
                    total > planned
                      ? tokens.colors.red[20].value
                      : total === planned
                        ? tokens.colors.green[20].value
                        : tokens.colors.yellow[20].value;
                  return (
                    <TableRow key={category.id} style={{backgroundColor}}>
                      <TableCell onClick={() => updateName(category)}>
                        {category.name}
                      </TableCell>
                      {preferRemaining ? (
                        <TableCell
                          onClick={() => props.onClickBudgetCategory(category)}
                        >
                          ${remaining.toFixed(2)}
                        </TableCell>
                      ) : (
                        <Fragment>
                          <TableCell
                            onClick={() => updatePlannedAmount(category)}
                          >
                            ${planned.toFixed(2)}
                          </TableCell>
                          <TableCell
                            onClick={() =>
                              props.onClickBudgetCategory(category)
                            }
                          >
                            ${total.toFixed(2)}
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell onClick={() => removeBudgetCategory(category)}>
                        ❌
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
                        section.title as "Saving" | "Needs" | "Wants" | "Income"
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
      <Divider style={{marginBottom: "20px", marginTop: "20px"}} />
      <Button isFullWidth onClick={() => togglePreferRemaining()}>
        {preferRemaining ? "Prefer Planned/Total" : "Prefer Remaining"}
      </Button>
    </>
  );
}
