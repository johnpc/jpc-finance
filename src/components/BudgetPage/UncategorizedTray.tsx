import { Badge, Flex, Text, useTheme } from "@aws-amplify/ui-react";
import TransactionBubble from "./TransactionBubble";
import { TransactionDialog } from "../transactions/TransactionDialog";
import { useSelection } from "../../hooks/useSelection";
import { CategoryEntity, TransactionEntity } from "../../lib/types";

type Props = {
  transactions: TransactionEntity[];
  categories: CategoryEntity[];
};

export const TRAY_HEIGHT = "150px";

/** Pinned tray of uncategorized transactions: drag one onto a category, or tap for options. */
export default function UncategorizedTray({ transactions, categories }: Props) {
  const { tokens } = useTheme();
  const { selected, select, clear } = useSelection(transactions);
  if (!transactions.length) return null;

  return (
    <>
      <Flex
        direction="column"
        gap="0.25rem"
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        height={TRAY_HEIGHT}
        backgroundColor={tokens.colors.background.secondary}
        boxShadow="large"
        style={{
          zIndex: 100,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="0.6rem 1rem 0"
        >
          <Text fontWeight="bold" fontSize="small">
            Uncategorized
          </Text>
          <Badge
            variation="warning"
            size="small"
            aria-label={`${transactions.length} uncategorized`}
          >
            {transactions.length}
          </Badge>
        </Flex>
        <Flex
          gap="0.5rem"
          padding="0.25rem 1rem 0.75rem"
          wrap="nowrap"
          style={{ overflowX: "auto" }}
        >
          {transactions.map((t) => (
            <TransactionBubble
              key={t.id}
              transaction={t}
              onClick={() => select(t)}
            />
          ))}
        </Flex>
      </Flex>
      {selected && (
        <TransactionDialog
          transaction={selected}
          categories={categories}
          onClose={clear}
        />
      )}
    </>
  );
}
