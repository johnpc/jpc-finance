import { Button, Divider, Text, useTheme } from "@aws-amplify/ui-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncAllTransactions } from "../../helpers/sync-all-transactions";
import { SettingsEntity } from "../../lib/types";

export default function SyncTransactionsButton({ date, settings }: { date: Date; settings?: SettingsEntity }) {
  const { tokens } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

  const syncTransactions = async () => {
    setError(false);
    setSyncing(true);
    try {
      await syncAllTransactions(date, settings);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setSyncing(false);
  };

  return (
    <>
      <Button isFullWidth isLoading={syncing} loadingText="Syncing... (this could take a while)" colorTheme="success" onClick={syncTransactions}>
        Sync Transactions Now
      </Button>
      {error ? (
        <Text color={tokens.colors.red[20]}>Sync error occurred.</Text>
      ) : (
        <Text fontSize="xs" color={tokens.colors.neutral[80]}>
          jpc.finance does not pull in transactions from linked accounts until you click this button.
        </Text>
      )}
      <Divider style={{ marginBottom: "20px" }} />
    </>
  );
}
