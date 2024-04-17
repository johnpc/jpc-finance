import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import amplifyconfiguration from "../../amplifyconfiguration.json";
import { useTellerConnect } from "teller-connect-react";

import { AuthUser } from "aws-amplify/auth";
import {
  Button,
  Card,
  Divider,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import Transactions from "./Transactions/Transactions";
import { syncTransactions } from "../helpers/sync-transactions";
import { TransactionEntity, createTellerAuthorization } from "../data/entity";
import { syncTellerioTransactions } from "../helpers/sync-tellerio-transactions";
export default function AccountsPage(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
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
      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => open()}
        disabled={!ready}
      >
        Add Bank / Card
      </Button>
      {Capacitor.getPlatform() !== "ios" ? null : (
        <>
          <Divider margin={"20px"} />
          <Button onClick={testFinanceKit} isFullWidth={true}>
            Link FinanceKit
          </Button>
        </>
      )}
      <Divider margin={"20px"} />
      <Button
        isFullWidth={true}
        isLoading={syncing}
        variation="link"
        onClick={() => syncAllTransactions()}
      >
        Sync Transactions Now
      </Button>
      <Transactions transactions={props.transactions} />
    </>
  );
}
