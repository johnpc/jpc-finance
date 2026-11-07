import { Button, Card, Text } from "@aws-amplify/ui-react";
import { useIsMutating } from "@tanstack/react-query";
import {
  SYNC_MUTATION_KEY,
  useSyncTransactions,
} from "../../hooks/useSyncTransactions";
import { useSyncHistory } from "../../hooks/useSyncHistory";
import { lastSyncText } from "../../lib/syncHistory";

export default function SyncTransactionsButton() {
  const sync = useSyncTransactions();
  const isSyncing = useIsMutating({ mutationKey: SYNC_MUTATION_KEY }) > 0;
  const { data: history } = useSyncHistory();
  const caption =
    lastSyncText(history?.[0]) ??
    "Transactions are pulled from your linked banks when you tap this button";

  return (
    <Card variation="outlined" marginBottom="1rem">
      <Button
        isFullWidth
        colorTheme="success"
        variation="primary"
        isLoading={isSyncing}
        loadingText="Syncing… you can keep budgeting"
        onClick={() => sync.mutate()}
      >
        Sync Transactions Now
      </Button>
      <Text
        fontSize="xs"
        color="font.tertiary"
        textAlign="center"
        marginTop="0.5rem"
      >
        {caption}
      </Text>
    </Card>
  );
}
