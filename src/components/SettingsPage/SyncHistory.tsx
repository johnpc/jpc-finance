import { Card, Flex, Heading, Text, useTheme } from "@aws-amplify/ui-react";
import { CheckCircle, Warning } from "@mui/icons-material";
import { useSyncHistory } from "../../hooks/useSyncHistory";
import {
  countText,
  durationText,
  sourceLabel,
  timestampText,
} from "../../lib/syncHistory";

/** Recent syncs from every source (web, iOS, Apple Card), newest first. */
export default function SyncHistory() {
  const { tokens } = useTheme();
  const { data: runs = [], isLoading } = useSyncHistory();

  return (
    <Card variation="outlined" marginBottom="1rem">
      <Heading level={5} marginBottom="0.5rem">
        Sync History
      </Heading>
      {!isLoading && !runs.length && (
        <Text fontSize="small" color="font.tertiary">
          No syncs yet
        </Text>
      )}
      {runs.map((run) => (
        <Flex
          key={run.id}
          alignItems="flex-start"
          gap="0.5rem"
          padding="0.5rem 0"
          style={{ borderBottom: `1px solid ${tokens.colors.border.tertiary}` }}
        >
          {run.error ? (
            <Warning
              fontSize="small"
              style={{ color: tokens.colors.orange[60].value }}
              aria-label="Failed"
            />
          ) : (
            <CheckCircle
              fontSize="small"
              style={{ color: tokens.colors.green[60].value }}
              aria-label="Succeeded"
            />
          )}
          <Flex direction="column" gap="0" flex="1" style={{ minWidth: 0 }}>
            <Text fontSize="small">
              {sourceLabel(run.source)} — {timestampText(run.startedAt)}
            </Text>
            <Text fontSize="xs" color="font.tertiary">
              {countText(run.newTransactionCount)} ·{" "}
              {durationText(run.durationMs)}
            </Text>
            {run.error && (
              <Text
                fontSize="xs"
                color={tokens.colors.red[80]}
                style={{ overflowWrap: "anywhere" }}
              >
                {run.error}
              </Text>
            )}
          </Flex>
        </Flex>
      ))}
    </Card>
  );
}
