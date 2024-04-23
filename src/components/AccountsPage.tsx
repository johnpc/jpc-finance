import { useCallback, useEffect, useState } from "react";
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
import {
  createLinkToken,
  exchangePublicToken,
  syncPlaidTransactions,
} from "../helpers/plaid";
import { usePlaidLink } from "react-plaid-link";

export default function AccountsPage(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
}) {
  const { tokens } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
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

  const handleAddAccountViaPlaid = async () => {
    plaidLink.open();
  };

  const syncAllTransactions = async () => {
    setError(false);
    setSyncing(true);
    try {
      await Promise.all([syncTellerioTransactions(), syncPlaidTransactions()]);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setSyncing(false);
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
