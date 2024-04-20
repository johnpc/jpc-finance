import {
  Button,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  TransactionEntity,
  updateTransaction,
} from "../../data/entity";
import { Fragment } from "react/jsx-runtime";

export default function BudgetCategoryDetail(props: {
  budgetCategory: BudgetCategoryEntity;
  onLeaveBudgetCategory: () => void;
}) {
  let spentTotal = props.budgetCategory.transactions.reduce(
    (acc, transaction) => transaction.amount + acc,
    0,
  );
  if (props.budgetCategory.type === "Income") {
    spentTotal = spentTotal * -1;
  }
  const backgroundColor =
    spentTotal > props.budgetCategory.plannedAmount
      ? "palevioletred"
      : "palegoldenrod";

  const onRemoveTransaction = (transaction: TransactionEntity) => {
    transaction.budgetCategoryId = null;
    updateTransaction(transaction);
  };

  return (
    <>
      <Heading>{props.budgetCategory.name}</Heading>

      <Table highlightOnHover={false} caption={props.budgetCategory.name}>
        <TableHead>
          <TableRow>
            <TableCell as="th">Date</TableCell>
            <TableCell as="th">Amount</TableCell>
            <TableCell as="th"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.budgetCategory.transactions.map((transaction) => (
            <Fragment key={transaction.id}>
              <TableRow key={`1${transaction.id}`} style={{ backgroundColor }}>
                <TableCell colSpan={3}>{transaction.name}</TableCell>
              </TableRow>
              <TableRow key={transaction.id} style={{ backgroundColor }}>
                <TableCell>
                  {transaction.date.toLocaleString(undefined, {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>${(transaction.amount / 100) * -1}</TableCell>
                <TableCell onClick={() => onRemoveTransaction(transaction)}>
                  ❌
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => props.onLeaveBudgetCategory()}
      >
        Done
      </Button>
    </>
  );
}
