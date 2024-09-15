import {
  AccountEntity,
  BudgetCategoryEntity,
  BudgetEntity,
  createBudgetForDate,
  SettingsEntity,
  TransactionEntity,
} from "../data/entity";
import UncategorizedTransactions from "./Budget/UncategorizedTransactions";
import BudgetProgress from "./Budget/BudgetProgress";
import BudgetTable from "./Budget/BudgetTable";
import { useEffect, useState } from "react";
import BudgetCategoryDetail from "./Budget/BudgetCategoryDetail";
import SyncTransactionsButton from "./Budget/SyncTransactionsButton";
import { Button } from "@aws-amplify/ui-react";
export default function BudgetPage(props: {
  budget: BudgetEntity | undefined;
  transactions: TransactionEntity[];
  accounts: AccountEntity[];
  date: Date;
  updateTransactions: () => Promise<void>;
  settings?: SettingsEntity;
}) {
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategoryEntity>();

  useEffect(() => {
    if (selectedCategory) {
      const category = props.budget?.budgetCategories.find(
        (c) => c.id === selectedCategory.id,
      );
      setSelectedCategory(category);
    }
  }, [props.transactions, selectedCategory, props.budget?.budgetCategories]);

  const createBudget = async () => {
    createBudgetForDate(props.date);
  };

  if (!props.budget) {
    return (
      <>
        <Button onClick={createBudget}>Create Budget</Button>
      </>
    );
  }

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
          <SyncTransactionsButton
            updateTransactions={props.updateTransactions}
            settings={props.settings}
            date={props.date}
          />
          <BudgetProgress {...props} budget={props.budget} />
          <BudgetTable
            {...props}
            budget={props.budget}
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
