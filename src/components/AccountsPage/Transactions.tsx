import { Table, TableBody, TableCell, TableHead, TableRow } from "@aws-amplify/ui-react";
import { useDate } from "../../hooks/useDate";
import { useTransactions } from "../../hooks/useTransactions";

export default function Transactions() {
  const { date } = useDate();
  const { data: transactions = [] } = useTransactions(date);
  if (!transactions.length) return <>No synced transactions</>;
  return (
    <Table highlightOnHover={false} caption="Your Transactions">
      <TableHead>
        <TableRow>
          <TableCell as="th">Date</TableCell>
          <TableCell as="th">Amount</TableCell>
          <TableCell as="th">Name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
            <TableCell>${(transaction.amount / 100).toFixed(2)}</TableCell>
            <TableCell>{transaction.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
