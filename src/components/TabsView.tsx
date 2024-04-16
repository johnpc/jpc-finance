import { Loader, Tabs } from "@aws-amplify/ui-react";
import BudgetPage from "./BudgetPage";
import AccountsPage from "./AccountsPage";
import SettingsPage from "./SettingsPage";
import { useEffect, useState } from "react";
import {
  BudgetEntity,
  TransactionEntity,
  createBudgetCategoryListener,
  createTransactionListener,
  getBudgetForDate,
  listTransactions,
  unsubscribeListener,
  updateBudgetCategoryListener,
  updateTransactionListener,
} from "../data/entity";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
export default function TabsView() {
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [budget, setBudget] = useState<BudgetEntity>();
  const [user, setUser] = useState<AuthUser>();

  useEffect(() => {
    const setup = async () => {
      const budget = await getBudgetForDate(new Date());
      setBudget(budget);
      const transactions = await listTransactions();
      setTransactions(transactions);
      const user = await getCurrentUser();
      setUser(user);
    };
    setup();
    const createBudgetCategorySubscription =
      createBudgetCategoryListener(setup);
    const updateBudgetCategorySubscription =
      updateBudgetCategoryListener(setup);
    const createTransactionSubscription = createTransactionListener(setup);
    const updateTransactionSubscription = updateTransactionListener(setup);
    return () => {
      unsubscribeListener(createBudgetCategorySubscription);
      unsubscribeListener(updateBudgetCategorySubscription);
      unsubscribeListener(createTransactionSubscription);
      unsubscribeListener(updateTransactionSubscription);
    };
  }, []);
  if (!budget || !user) return <Loader />;
  return (
    <>
      <Tabs
        spacing="equal"
        justifyContent="space-between"
        defaultValue="Budget"
        items={[
          {
            label: "Budget",
            value: "Budget",
            content: <BudgetPage budget={budget} />,
          },
          {
            label: "Accounts",
            value: "Accounts",
            content: <AccountsPage transactions={transactions} user={user} />,
          },
          {
            label: "Settings",
            value: "Settings",
            content: <SettingsPage />,
          },
        ]}
      />
    </>
  );
}
