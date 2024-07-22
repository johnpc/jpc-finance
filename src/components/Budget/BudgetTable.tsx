import {
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
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
import { Fragment, useState } from "react";
import { Delete } from "@mui/icons-material";

export default function BudgetTable(props: {
  budget: BudgetEntity;
  transactions: TransactionEntity[];
  onClickBudgetCategory: (category: BudgetCategoryEntity) => void;
}) {
  const { tokens } = useTheme();
  const [preferRemaining, setPreferRemaining] = useState<boolean>(false);
  const incomeCategory = props.budget.budgetCategories.filter(
    (budgetCategory) => budgetCategory.type === "Income",
  )!;
  const incomeAmount = incomeCategory.reduce((acc, category) => acc + category.plannedAmount, 0) / 100;

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
    if (!plannedAmountString) {
      return;
    }
    const plannedAmount = parseInt(plannedAmountString!);
    await updateBudgetCategory({
      ...budgetCategory,
      plannedAmount:
        (plannedAmount ?? budgetCategory.plannedAmount / 100) * 100,
    });
  };

  const togglePreferRemaining = () => {
    setPreferRemaining(!preferRemaining);
  };

  return (
    <>
      {sections.map((section) => {
        const categories = props.budget.budgetCategories.filter(
          (budgetCategory) => budgetCategory.type === section.title,
        );
        const sectionPlannedAmount = categories.reduce(
          (acc, category) => acc + category.plannedAmount / 100,
          0,
        );
        const sectionSpentAmount =
          categories.reduce(
            (acc, category) =>
              acc +
              category.transactions.reduce(
                (sum, transaction) => sum + transaction.amount,
                0,
              ),
            0,
          ) / 100;
        const moneyFormatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        console.log({
          sectionSpentAmount,
          sectionPlannedAmount,
        });
        const caption = (
          <>
            <Text
              as="div"
              fontSize={tokens.fontSizes.large}
              fontWeight={"bold"}
            >
              {section.title}
            </Text>
            <Text>
              Spent {moneyFormatter.format(sectionSpentAmount)} (
              {((sectionSpentAmount * 100) / sectionPlannedAmount).toFixed(0)}%
              of planned)
            </Text>
            <Text marginBottom={tokens.space.small}>
              {" "}
              {section.subtitle} - {moneyFormatter.format(sectionPlannedAmount)}{" "}
              ({((sectionPlannedAmount / incomeAmount) * 100).toFixed(0)}%)
            </Text>
            <Divider marginBottom={tokens.space.xs} />
          </>
        );
        return (
          <Fragment key={section.title}>
            <Table highlightOnHover={false} caption={caption}>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Name</TableCell>
                  {preferRemaining ? (
                    <TableCell as="th">Remaining</TableCell>
                  ) : (
                    <Fragment>
                      <TableCell as="th">Planned</TableCell>
                      <TableCell as="th">Total</TableCell>
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
                    0,
                  );
                  if (category.type === "Income") {
                    total = total * -1;
                  }
                  const remaining = planned - total;
                  let backgroundColor = "";
                  if (total > planned - planned * 0.1)
                    backgroundColor = tokens.colors.yellow[20].value;
                  if (total > planned - planned * 0.01)
                    backgroundColor = tokens.colors.green[20].value;
                  if (total > planned)
                    backgroundColor = tokens.colors.red[20].value;
                  return (
                    <TableRow key={category.id} style={{ backgroundColor }}>
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
                        <Delete />
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
      <Button isFullWidth onClick={() => togglePreferRemaining()}>
        {preferRemaining ? "Prefer Planned/Total" : "Prefer Remaining"}
      </Button>
    </>
  );
}
