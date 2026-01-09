import { useCallback, useEffect, useState } from "react";
import { useTellerConnect } from "teller-connect-react";
import { usePlaidLink } from "react-plaid-link";
import { Button, Divider, Loader } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";
import { Capacitor } from "@capacitor/core";
import { JPCFinanceKit } from "@johnpc/financekit-capacitor";
import { useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import { useDate } from "../../hooks/useDateHook";
import { useSettings } from "../../hooks/useSettings";
import { createLinkToken, exchangePublicToken } from "../../helpers/plaid";
import { syncAllTransactions } from "../../helpers/sync-all-transactions";
import Accounts from "./Accounts";
import Transactions from "./Transactions";

export default function AccountsPage() {
  const { date } = useDate();
  const { data: settings } = useSettings();
  const [plaidToken, setPlaidToken] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  const { open, ready } = useTellerConnect({
    applicationId: "app_otq7p1qk69rkla3vmq000",
    onSuccess: async (authorization: { accessToken: string }) => {
      setSyncing(true);
      const user = await getCurrentUser();
      await client.models.TellerAuthorization.create({
        accessToken: authorization.accessToken,
        amplifyUserId: user.userId,
      });
      await syncAllTransactions(date, settings);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setSyncing(false);
    },
  });

  const onPlaidSuccess = useCallback(
    async (publicToken: string) => {
      setSyncing(true);
      await exchangePublicToken(publicToken);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setSyncing(false);
    },
    [queryClient],
  );

  const plaidLink = usePlaidLink({
    token: plaidToken,
    onSuccess: onPlaidSuccess,
  });

  useEffect(() => {
    createLinkToken().then(setPlaidToken);
  }, []);

  const handleAddAccountViaFinanceKit = async () => {
    await JPCFinanceKit.requestAuthorization();
    await client.models.Settings.update({
      id: settings!.id,
      enableFinanceKit: true,
    });
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  const handleRemoveFinanceKit = async () => {
    await client.models.Settings.update({
      id: settings!.id,
      enableFinanceKit: false,
    });
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  return (
    <>
      {syncing && <Loader variation="linear" />}
      <Accounts />
      <Divider margin="20px" />
      <Button isFullWidth colorTheme="info" onClick={open} disabled={!ready}>
        Link Account via Teller
      </Button>
      <Divider style={{ marginBottom: "20px", marginTop: "20px" }} />
      <Button
        isFullWidth
        variation="primary"
        colorTheme="info"
        onClick={() => plaidLink.open()}
        disabled={!plaidLink.ready}
      >
        Link Account via Plaid
      </Button>
      {Capacitor.getPlatform() === "ios" && (
        <>
          <Divider margin="20px" />
          {settings?.enableFinanceKit ? (
            <Button onClick={handleRemoveFinanceKit} isFullWidth>
              Unlink FinanceKit
            </Button>
          ) : (
            <Button
              disabled={!settings}
              onClick={handleAddAccountViaFinanceKit}
              isFullWidth
            >
              Link FinanceKit
            </Button>
          )}
        </>
      )}
      <Divider margin="20px" />
      <Transactions />
    </>
  );
}
