import { useCallback, useEffect, useState } from "react";
import { useTellerConnect } from "teller-connect-react";
import { AuthUser } from "aws-amplify/auth";
import { Button, Divider, Loader } from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import Transactions from "./Transactions/Transactions";
import {
  AccountEntity,
  TransactionEntity,
  createTellerAuthorization,
} from "../data/entity";
import Accounts from "./Accounts/Accounts";
import { createLinkToken, exchangePublicToken } from "../helpers/plaid";
import { usePlaidLink } from "react-plaid-link";
import { syncAllTransactions } from "../helpers/sync-all-transactions";

export default function AccountsPage(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
}) {
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { open, ready } = useTellerConnect({
    applicationId: "app_otq7p1qk69rkla3vmq000",
    onSuccess: async (authorization) => {
      // Save your access token here
      console.log({ authorization });
      setSyncing(true);
      await createTellerAuthorization(authorization.accessToken);
      await syncAllTransactions(new Date());
      setSyncing(false);
    },
  });

  const handleAddAccount = async () => {
    open();
  };

  const handleAddAccountViaPlaid = async () => {
    plaidLink.open();
  };

  const testFinanceKit = async () => {
    console.log("TODO: Add FinanceKit support");
  };

  let isOauth = false;

  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    setSyncing(true);
    await exchangePublicToken(publicToken);
    setSyncing(false);
  }, []);

  const plaidConfig = {
    token: plaidToken,
    onSuccess: onPlaidSuccess,
    receivedRedirectUri: window.location.href.includes("?oauth_state_id=")
      ? window.location.href
      : undefined,
  };

  // For OAuth, configure the received redirect URI
  if (window.location.href.includes("?oauth_state_id=")) {
    plaidConfig.receivedRedirectUri = window.location.href;
    isOauth = true;
  }
  const plaidLink = usePlaidLink(plaidConfig);
  useEffect(() => {
    const setup = async () => {
      if (plaidToken == null) {
        const token = await createLinkToken();
        setPlaidToken(token);
      }
    };
    setup();
    console.log({ plaidToken });
    if (isOauth && plaidLink.ready) {
      console.log({ open: "open" });
      plaidLink.open();
    }
  }, [plaidToken, isOauth, plaidLink, plaidLink.ready, plaidLink.open]);

  return (
    <>
      {syncing ? <Loader variation="linear" /> : null}
      <Accounts accounts={props.accounts} />
      <Divider margin={"20px"} />
      <Button
        isFullWidth={true}
        colorTheme="info"
        onClick={() => handleAddAccount()}
        disabled={!ready}
      >
        Link Account via Teller
      </Button>
      <Divider style={{ marginBottom: "20px", marginTop: "20px" }} />
      <Button
        isFullWidth={true}
        variation="primary"
        colorTheme="info"
        onClick={() => handleAddAccountViaPlaid()}
        disabled={!ready}
      >
        Link Account via Plaid
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
