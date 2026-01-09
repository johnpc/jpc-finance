import { queryKeys } from "../../lib/queryKeys";
import { Button, Divider, Text, useTheme } from "@aws-amplify/ui-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncAllTransactions } from "../../helpers/sync-all-transactions";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useDate } from "../../hooks/useDateHook";
import { useSettings } from "../../hooks/useSettings";

export default function SyncTransactionsButton() {
  const { tokens } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { withErrorHandling } = useErrorHandler();
  const { date } = useDate();
  const { data: settings } = useSettings();

  const syncTransactions = async () => {
    setSyncing(true);
    await withErrorHandling(async () => {
      await syncAllTransactions(date, settings);
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    }, "Failed to sync transactions");
    setSyncing(false);
  };

  return (
    <>
      <Button
        isFullWidth
        isLoading={syncing}
        loadingText="Syncing... (this could take a while)"
        colorTheme="success"
        onClick={syncTransactions}
      >
        Sync Transactions Now
      </Button>
      <Text fontSize="xs" color={tokens.colors.neutral[80]}>
        jpc.finance does not pull in transactions from linked accounts until you
        click this button.
      </Text>
      <Divider style={{ marginBottom: "20px" }} />
    </>
  );
}
