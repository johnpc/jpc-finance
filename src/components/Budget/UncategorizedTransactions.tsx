import { Collection, ScrollView } from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  TransactionEntity,
} from "../../data/entity";
import UncategorizedTransactionBubble from "./UncategorizedTransactionBubble";

export default function UncategorizedTransactions(props: {
  budgetCategories: BudgetCategoryEntity[],
  transactions: TransactionEntity[],
}) {
  const uncategorizedTransactions = props.transactions?.filter(transaction => !transaction.budgetCategoryId);

  if (!uncategorizedTransactions.length) return null;
  return (
    <ScrollView position={"fixed"} bottom={"0px"} height={"150px"} width="100%">
      <Collection
        type="list"
        direction={"row"}
        wrap={"nowrap"}
        gap={"20px"}
        items={uncategorizedTransactions}
      >
        {(transaction) => (
          <UncategorizedTransactionBubble
            key={transaction.id}
            budgetCategories={props.budgetCategories}
            transaction={transaction}
          />
        )}
      </Collection>
    </ScrollView>
  );
}
