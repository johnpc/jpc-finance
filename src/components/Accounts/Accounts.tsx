import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import { AccountEntity } from "../../data/entity";

export default function Accounts(props: { accounts: AccountEntity[] }) {
  return (
    <>
      <Table highlightOnHover={false} caption={"Your Linked Accounts"}>
        <TableHead>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Bank</TableCell>
            <TableCell as="th">Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.institutionName}</TableCell>
              <TableCell>{account.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
