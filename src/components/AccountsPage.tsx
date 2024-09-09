import { useCallback, useEffect, useState } from "react";
import { useTellerConnect } from "teller-connect-react";
import { AuthUser } from "aws-amplify/auth";
import { Button, Divider, Loader } from "@aws-amplify/ui-react";
import Transactions from "./Transactions/Transactions";
import {
  AccountEntity,
  SettingsEntity,
  TransactionEntity,
  createTellerAuthorization,
  updateSettings,
} from "../data/entity";
import Accounts from "./Accounts/Accounts";
import { createLinkToken, exchangePublicToken } from "../helpers/plaid";
import { usePlaidLink } from "react-plaid-link";
import { syncAllTransactions } from "../helpers/sync-all-transactions";
import { JPCFinanceKit } from "@johnpc/financekit-capacitor";
import { Capacitor } from "@capacitor/core";

export default function AccountsPage(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
  settings?: SettingsEntity;
}) {
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { open, ready } = useTellerConnect({
    applicationId: "app_otq7p1qk69rkla3vmq000",
    onSuccess: async (authorization: {accessToken: string}) => {
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

  const handleAddAccountViaFinanceKit = async () => {
    const auth = await JPCFinanceKit.requestAuthorization();
    console.log({ auth });
    const updatedSettings = await updateSettings({
      ...props.settings!,
      enableFinanceKit: true,
    });
    console.log({ updatedSettings });
  };

  const handleRemoveFinanceKit = async () => {
    await updateSettings({ ...props.settings!, enableFinanceKit: false });
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
      {Capacitor.getPlatform() !== "ios" ? null : (
        <>
          <Divider margin={"20px"} />
          {props.settings?.enableFinanceKit ? (
            <Button onClick={handleRemoveFinanceKit} isFullWidth={true}>
              Unlink FinanceKit
            </Button>
          ) : (
            <Button
              disabled={!props.settings}
              onClick={handleAddAccountViaFinanceKit}
              isFullWidth={true}
            >
              Link FinanceKit
            </Button>
          )}
        </>
      )}
      <Divider margin={"20px"} />
      <Transactions transactions={props.transactions} />
    </>
  );
}
