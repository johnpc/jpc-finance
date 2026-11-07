import { Button, Card, Heading, Text } from "@aws-amplify/ui-react";
import AccountList from "./AccountList";
import { ReauthBanner } from "../plaid/ReauthBanner";
import { TransactionList } from "../transactions/TransactionList";
import { TransactionDialog } from "../transactions/TransactionDialog";
import { useAccountsPage } from "../../hooks/useAccountsPage";
import { formatMonthYear } from "../../lib/dateUtils";

export default function AccountsPage() {
  const { date, transactions, categories, selection, startLink, isBusy } =
    useAccountsPage();

  return (
    <>
      <ReauthBanner />
      <Card variation="outlined" marginBottom="1rem">
        <Heading level={5} marginBottom="0.5rem">
          Linked Accounts
        </Heading>
        <AccountList />
        <Button
          isFullWidth
          variation="primary"
          marginTop="1rem"
          isLoading={isBusy}
          loadingText="Opening Plaid…"
          onClick={startLink}
        >
          Link a bank account
        </Button>
        <Text
          fontSize="xs"
          color="font.tertiary"
          marginTop="0.5rem"
          textAlign="center"
        >
          Banks connect securely through Plaid. Manage or unlink banks in
          Settings.
        </Text>
      </Card>
      <Card variation="outlined">
        <Heading level={5} marginBottom="0.5rem">
          Transactions in {formatMonthYear(date)}
        </Heading>
        <TransactionList
          transactions={transactions}
          emptyText="No transactions this month yet."
          onSelect={selection.select}
        />
      </Card>
      {selection.selected && (
        <TransactionDialog
          transaction={selection.selected}
          categories={categories}
          onClose={selection.clear}
        />
      )}
    </>
  );
}
