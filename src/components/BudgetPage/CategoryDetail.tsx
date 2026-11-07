import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@aws-amplify/ui-react";
import { ArrowBack } from "@mui/icons-material";
import { TransactionList } from "../transactions/TransactionList";
import { TransactionDialog } from "../transactions/TransactionDialog";
import { useCategoryDetail } from "../../hooks/useCategoryDetail";
import { categoryStatus, remainingText } from "../../lib/categoryStatus";
import { formatMoney } from "../../lib/currency";
import { CategoryEntity, CategoryWithTransactions } from "../../lib/types";

type Props = {
  category: CategoryWithTransactions;
  allCategories: CategoryEntity[];
  onBack: () => void;
};

export default function CategoryDetail({
  category,
  allCategories,
  onBack,
}: Props) {
  const { form, selection, deleteCategory, uncategorize } = useCategoryDetail(
    category,
    onBack,
  );
  const status = categoryStatus(category);

  return (
    <>
      <Button variation="link" onClick={onBack} gap="0.25rem" paddingLeft="0">
        <ArrowBack fontSize="small" /> Back to budget
      </Button>
      <Heading level={4} marginBottom="1rem">
        {category.type} · {category.name}
      </Heading>
      <Card variation="outlined" marginBottom="1rem">
        <form onSubmit={form.submit}>
          <Flex direction="column" gap="0.75rem">
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              hasError={!!form.nameError}
              errorMessage={form.nameError}
            />
            <TextField
              label="Monthly target ($)"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => form.setAmount(e.target.value)}
              hasError={!!form.amountError}
              errorMessage={form.amountError}
            />
            <Flex justifyContent="space-between" alignItems="center">
              <Text color="font.tertiary">
                {formatMoney(status.amount)} {status.label} ·{" "}
                {remainingText(category)}
              </Text>
              <Button
                type="submit"
                variation="primary"
                size="small"
                isDisabled={!form.isDirty}
              >
                Save
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
      <Heading level={6} marginBottom="0.5rem">
        Transactions ({category.transactions.length})
      </Heading>
      <TransactionList
        transactions={category.transactions}
        emptyText="Drag transactions here from the Uncategorized tray, or pick this category in a transaction's details."
        onSelect={selection.select}
        actionLabel="Uncategorize"
        onAction={(t) => uncategorize(t.id)}
      />
      <Button
        variation="link"
        colorTheme="error"
        marginTop="1.5rem"
        onClick={deleteCategory}
      >
        Delete category
      </Button>
      {selection.selected && (
        <TransactionDialog
          transaction={selection.selected}
          categories={allCategories}
          onClose={selection.clear}
        />
      )}
    </>
  );
}
