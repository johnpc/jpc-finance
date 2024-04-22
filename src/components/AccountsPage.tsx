import { useState } from "react";
import { useTellerConnect } from "teller-connect-react";
import { AuthUser } from "aws-amplify/auth";
import { Button, Divider, Text, useTheme } from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import Transactions from "./Transactions/Transactions";
import {
  AccountEntity,
  TransactionEntity,
  createTellerAuthorization,
} from "../data/entity";
import { syncTellerioTransactions } from "../helpers/sync-tellerio-transactions";
import Accounts from "./Accounts/Accounts";
export default function AccountsPage(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
}) {
  const { tokens } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const { open, ready } = useTellerConnect({
    applicationId: "app_otq7p1qk69rkla3vmq000",
    onSuccess: async (authorization) => {
      // Save your access token here
      console.log({ authorization });
      await createTellerAuthorization(authorization.accessToken);
      await syncAllTransactions();
    },
  });

  const handleAddAccount = async () => {
    open();
  };

  const syncAllTransactions = async () => {
    setError(false);
    setSyncing(true);
    try {
      await syncTellerioTransactions();
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setSyncing(false);
  };

  const testFinanceKit = async () => {
    console.log("TODO: Add FinanceKit support");
  };

  return (
    <>
      {error ? (
        <Text color={tokens.colors.red[20]}>Sync error occurred.</Text>
      ) : null}
      {syncing || props.accounts.length ? (
        <Button
          isFullWidth={true}
          isLoading={syncing}
          loadingText="Syncing"
          variation="link"
          onClick={() => syncAllTransactions()}
        >
          Sync Transactions Now
        </Button>
      ) : null}
      <Accounts accounts={props.accounts} />
      <Divider margin={"20px"} />
      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => handleAddAccount()}
        disabled={!ready}
      >
        Add Bank / Card
      </Button>
      {Capacitor.getPlatform() !== "TODO: Add FinanceKit" ? null : (
        <>
          <Divider margin={"20px"} />
          <Button onClick={testFinanceKit} isFullWidth={true}>
            Link FinanceKit
          </Button>
        </>
      )}
      <Divider margin={"20px"} />
      <Transactions transactions={props.transactions} />
    </>
  );
}
