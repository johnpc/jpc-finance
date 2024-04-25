import {
  AccountEntity,
  BudgetCategoryEntity,
  BudgetEntity,
  TransactionEntity,
} from "../data/entity";
import UncategorizedTransactions from "./Budget/UncategorizedTransactions";
import BudgetProgress from "./Budget/BudgetProgress";
import BudgetTable from "./Budget/BudgetTable";
import { useEffect, useState } from "react";
import BudgetCategoryDetail from "./Budget/BudgetCategoryDetail";
import SyncTransactionsButton from "./Budget/SyncTransactionsButton";

export default function BudgetPage(props: {
  budget: BudgetEntity;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
}) {
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategoryEntity>();

  useEffect(() => {
    if (selectedCategory) {
      const category = props.budget.budgetCategories.find(
        (c) => c.id === selectedCategory.id,
      );
      setSelectedCategory(category);
    }
  }, [props.transactions, selectedCategory, props.budget.budgetCategories]);

  return (
    <>
      {selectedCategory ? (
        <>
          <BudgetCategoryDetail
            budgetCategory={selectedCategory}
            onLeaveBudgetCategory={() => setSelectedCategory(undefined)}
          />
        </>
      ) : (
        <>
          <SyncTransactionsButton />
          <BudgetProgress {...props} />
          <BudgetTable
            {...props}
            onClickBudgetCategory={(category) => setSelectedCategory(category)}
          />
          <UncategorizedTransactions
            budgetCategories={props.budget.budgetCategories}
            transactions={props.transactions}
          />
        </>
      )}
    </>
  );
}
