import { Button, Divider, Text, useTheme } from "@aws-amplify/ui-react";
import { useState } from "react";
import { syncAllTransactions } from "../../helpers/sync-all-transactions";
import { SettingsEntity } from "../../data/entity";
export default function SyncTransactionsButton(props: {
  date: Date;
  settings?: SettingsEntity;
}) {
  const { tokens } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const syncTransactions = async () => {
    setError(false);
    setSyncing(true);
    try {
      await syncAllTransactions(props.date, props.settings);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setSyncing(false);
  };

  return (
    <>
      <Button
        isFullWidth={true}
        isLoading={syncing}
        loadingText="Syncing... (this could take a while)"
        colorTheme="success"
        onClick={() => syncTransactions()}
      >
        Sync Transactions Now
      </Button>
      {error ? (
        <Text color={tokens.colors.red[20]}>Sync error occurred.</Text>
      ) : (
        <Text fontSize={"xs"} color={tokens.colors.neutral[80]}>
          jpc.finance does not pull in transactions from linked accounts until
          you click this button.
        </Text>
      )}
      <Divider style={{ marginBottom: "20px" }} />
    </>
  );
}
