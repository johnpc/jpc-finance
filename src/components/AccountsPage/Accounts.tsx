import { Table, TableBody, TableCell, TableHead, TableRow } from "@aws-amplify/ui-react";
import { useAccounts } from "../../hooks/useAccounts";

export default function Accounts() {
  const { data: accounts = [] } = useAccounts();
  if (!accounts.length) return <>No linked accounts</>;
  return (
    <Table highlightOnHover={false} caption="Your Linked Accounts">
      <TableHead>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Bank</TableCell>
          <TableCell as="th">Type</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>{account.name}</TableCell>
            <TableCell>{account.institutionName}</TableCell>
            <TableCell>{account.type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
