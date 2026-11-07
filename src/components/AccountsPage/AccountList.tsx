import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { useAccounts } from "../../hooks/useAccounts";

export default function AccountList() {
  const { tokens } = useTheme();
  const { data: accounts = [], isLoading } = useAccounts();

  if (isLoading) return <Text color="font.tertiary">Loading accounts…</Text>;
  if (!accounts.length) {
    return (
      <Text color="font.tertiary">
        No linked accounts yet. Link a bank to get started.
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="0">
      {accounts.map((a) => (
        <Flex
          key={a.id}
          justifyContent="space-between"
          alignItems="center"
          padding="0.6rem 0"
          style={{ borderBottom: `1px solid ${tokens.colors.border.tertiary}` }}
        >
          <Flex direction="column" gap="0">
            <Text fontWeight="bold">{a.name}</Text>
            <Text fontSize="xs" color="font.tertiary">
              {a.institutionName}
            </Text>
          </Flex>
          <Flex direction="column" gap="0" alignItems="flex-end">
            <Text fontSize="small" style={{ textTransform: "capitalize" }}>
              {a.subType}
            </Text>
            {a.lastFour !== null && a.lastFour !== undefined && (
              <Text fontSize="xs" color="font.tertiary">
                ••••{a.lastFour}
              </Text>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
