import { Alert, Button, Flex, Text } from "@aws-amplify/ui-react";
import { useLinkedBanks } from "../../hooks/useLinkedBanks";
import { bankDisplayName } from "../../lib/plaidSync";

/** Shown when a sync reported that a bank's login expired. */
export function ReauthBanner() {
  const { needingReauth, startReauth, isBusy } = useLinkedBanks();
  if (!needingReauth.length) return null;

  return (
    <Alert
      variation="warning"
      heading="A bank needs you to log in again"
      marginBottom="1rem"
    >
      <Text fontSize="small">
        Syncing is paused for these banks until you reconnect. Your existing
        transactions are safe.
      </Text>
      <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem">
        {needingReauth.map((c) => (
          <Button
            key={c.id}
            size="small"
            isDisabled={isBusy}
            onClick={() => startReauth(c)}
          >
            Reconnect {bankDisplayName(c)}
          </Button>
        ))}
      </Flex>
    </Alert>
  );
}
