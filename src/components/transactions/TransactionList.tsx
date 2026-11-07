import { Button, Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { formatMoney } from "../../lib/currency";
import { formatShortDate } from "../../lib/dateUtils";
import { displayedName } from "../../lib/transactionName";
import { TransactionEntity } from "../../lib/types";

type Props = {
  transactions: TransactionEntity[];
  emptyText: string;
  onSelect: (t: TransactionEntity) => void;
  actionLabel?: string;
  onAction?: (t: TransactionEntity) => void;
};

/** Date, name, and amount rows; clicking a row opens its details. */
export function TransactionList({
  transactions,
  emptyText,
  onSelect,
  actionLabel,
  onAction,
}: Props) {
  const { tokens } = useTheme();
  if (!transactions.length) {
    return (
      <Text color="font.tertiary" fontSize="small">
        {emptyText}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="0">
      {transactions.map((t) => {
        const isIncome = t.amount < 0;
        return (
          <Flex
            key={t.id}
            alignItems="center"
            gap="0.75rem"
            padding="0.6rem 0"
            style={{
              borderBottom: `1px solid ${tokens.colors.border.tertiary}`,
              cursor: "pointer",
            }}
            onClick={() => onSelect(t)}
          >
            <Flex direction="column" gap="0" flex="1" style={{ minWidth: 0 }}>
              <Text
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayedName(t)}
              </Text>
              <Text fontSize="xs" color="font.tertiary">
                {formatShortDate(t.date)}
                {t.pending && " · Pending"}
              </Text>
            </Flex>
            <Text fontWeight="bold" color={isIncome ? "green" : undefined}>
              {isIncome ? "+" : ""}
              {formatMoney(t.amount)}
            </Text>
            {actionLabel && onAction && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(t);
                }}
              >
                {actionLabel}
              </Button>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}
