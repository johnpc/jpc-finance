import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { Delete } from "@mui/icons-material";
import { useLinkedBanks } from "../../hooks/useLinkedBanks";
import { bankDisplayName } from "../../lib/plaidSync";
import { timestampText } from "../../lib/syncHistory";

export default function LinkedBanks() {
  const { tokens } = useTheme();
  const {
    connections,
    isLoading,
    needsReauth,
    startLink,
    startReauth,
    confirmUnlink,
    isBusy,
  } = useLinkedBanks();

  return (
    <Card variation="outlined" marginBottom="1rem">
      <Heading level={5} marginBottom="0.5rem">
        Linked Banks
      </Heading>
      {!isLoading && !connections.length && (
        <Text fontSize="small" color="font.tertiary">
          No banks linked yet.
        </Text>
      )}
      {connections.map((c) => (
        <Flex
          key={c.id}
          alignItems="center"
          gap="0.5rem"
          padding="0.5rem 0"
          style={{ borderBottom: `1px solid ${tokens.colors.border.tertiary}` }}
        >
          <Flex direction="column" gap="0" flex="1">
            <Text>
              {bankDisplayName(c)}{" "}
              {needsReauth(c) && (
                <Badge variation="warning" size="small">
                  Login expired
                </Badge>
              )}
            </Text>
            <Text fontSize="xs" color="font.tertiary">
              {c.createdAt
                ? `Added ${timestampText(c.createdAt)}`
                : "Linked via Plaid"}
            </Text>
          </Flex>
          {needsReauth(c) && (
            <Button
              size="small"
              isDisabled={isBusy}
              onClick={() => startReauth(c)}
            >
              Reconnect
            </Button>
          )}
          <Button
            size="small"
            variation="link"
            colorTheme="error"
            isDisabled={isBusy}
            onClick={() => confirmUnlink(c)}
            aria-label={`Unlink ${bankDisplayName(c)}`}
          >
            <Delete fontSize="small" />
          </Button>
        </Flex>
      ))}
      <Button
        size="small"
        marginTop="0.75rem"
        isDisabled={isBusy}
        onClick={startLink}
      >
        + Link another bank
      </Button>
    </Card>
  );
}
