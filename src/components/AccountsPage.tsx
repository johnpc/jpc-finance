import { useState } from "react";
import { useTellerConnect } from "teller-connect-react";

import { AuthUser } from "aws-amplify/auth";
import { Button, Divider } from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import Transactions from "./Transactions/Transactions";
import { syncTransactions } from "../helpers/sync-transactions";
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
  const [syncing, setSyncing] = useState(false);
  const { open, ready } = useTellerConnect({
    applicationId: "app_otq7p1qk69rkla3vmq000",
    onSuccess: (authorization) => {
      // Save your access token here
      console.log({ authorization });
      createTellerAuthorization(authorization.accessToken);
    },
  });

  const syncAllTransactions = async () => {
    setSyncing(true);
    await syncTellerioTransactions();
    setSyncing(false);
  };

  const testFinanceKit = async () => {
    await syncTransactions();
    // JPCFinanceKit.repeatt({ value: "wassap!!" });
    // JPCFinanceKit.requestAuthorization();
  };

  return (
    <>
      {props.accounts.length ? (
        <Button
          isFullWidth={true}
          isLoading={syncing}
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
        onClick={() => open()}
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
