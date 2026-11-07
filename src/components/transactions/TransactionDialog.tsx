import { Button, Flex, Text, TextField } from "@aws-amplify/ui-react";
import { Modal } from "../common/Modal";
import { CategoryPicker } from "./CategoryPicker";
import { useTransactionDialog } from "../../hooks/useTransactionDialog";
import { CategoryEntity, TransactionEntity } from "../../lib/types";
import { formatMoney } from "../../lib/currency";

type Props = {
  transaction: TransactionEntity;
  categories: CategoryEntity[];
  onClose: () => void;
};

/** Rename, (re)categorize, or delete one transaction. */
export function TransactionDialog({ transaction, categories, onClose }: Props) {
  const { name, setName, isNameDirty, saveName, moveTo, remove, close } =
    useTransactionDialog(transaction, onClose);
  const isIncome = transaction.amount < 0;

  return (
    <Modal title="Transaction" onClose={close}>
      <Flex direction="row" alignItems="flex-end" gap="0.5rem">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
          flex="1"
          autoFocus
        />
        {isNameDirty && <Button onClick={saveName}>Save</Button>}
      </Flex>
      {transaction.displayName && (
        <Text fontSize="small" color="font.tertiary">
          Original name: {transaction.name}
        </Text>
      )}
      <Flex justifyContent="space-between">
        <Text>
          {transaction.date.toLocaleDateString("en-US", {
            dateStyle: "medium",
          })}
          {transaction.pending && " · Pending"}
        </Text>
        <Text fontWeight="bold" color={isIncome ? "green" : undefined}>
          {isIncome ? "+" : "-"}
          {formatMoney(transaction.amount)}
        </Text>
      </Flex>
      <CategoryPicker
        categories={categories}
        value={transaction.budgetCategoryId ?? null}
        onChange={moveTo}
      />
      <Flex justifyContent="space-between">
        <Button variation="link" colorTheme="error" onClick={remove}>
          Delete transaction
        </Button>
        <Button variation="primary" onClick={close}>
          Done
        </Button>
      </Flex>
    </Modal>
  );
}
