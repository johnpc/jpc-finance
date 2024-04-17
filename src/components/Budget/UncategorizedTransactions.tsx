import { Collection, ScrollView } from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  TransactionEntity,
  listTransactions,
} from "../../data/entity";
import { useEffect, useState } from "react";
import UncategorizedTransactionBubble from "./UncategorizedTransactionBubble";

export default function UncategorizedTransactions(props: {
  budgetCategories: BudgetCategoryEntity[];
}) {
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  useEffect(() => {
    const setup = async () => {
      const t = await listTransactions(new Date());
      const filtered = t.filter(
        (t) =>
          !t.deleted &&
          t.transactionMonth ===
            new Date().toLocaleDateString(undefined, {
              month: "2-digit",
              year: "2-digit",
            }) &&
          !t.budgetCategoryId,
      );
      setTransactions(filtered);
    };
    setup();
  }, []);
  if (!transactions?.length) return null;

  return (
    <ScrollView position={"fixed"} bottom={"0px"} height={"150px"} width="100%">
      <Collection
        type="list"
        direction={"row"}
        wrap={"nowrap"}
        gap={"20px"}
        items={transactions}
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
