import { Loader, Tabs } from "@aws-amplify/ui-react";
import BudgetPage from "./BudgetPage";
import AccountsPage from "./AccountsPage";
import SettingsPage from "./SettingsPage";
import { useEffect, useState } from "react";
import {
  AccountEntity,
  BudgetEntity,
  TransactionEntity,
  createAccountListener,
  createBudgetCategoryListener,
  createTransactionListener,
  deleteBudgetCategoryListener,
  getBudgetForDate,
  listAccounts,
  listTransactions,
  unsubscribeListener,
  updateBudgetCategoryListener,
  updateTransactionListener,
} from "../data/entity";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { App } from "@capacitor/app";
export default function TabsView() {
  const [toggleListeners, setToggleListeners] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [budget, setBudget] = useState<BudgetEntity>();
  const [user, setUser] = useState<AuthUser>();

  const setup = async () => {
    const budget = await getBudgetForDate(new Date());
    setBudget(budget);
    const transactions = await listTransactions(new Date());
    setTransactions(transactions);
    const accounts = await listAccounts();
    setAccounts(accounts);
    const user = await getCurrentUser();
    setUser(user);
  };

  useEffect(() => {
    setup();
  }, []);

  useEffect(() => {
    const createBudgetCategorySubscription = createBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(new Date());
        setBudget(budget);
      },
    );
    const updateBudgetCategorySubscription = updateBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(new Date());
        setBudget(budget);
      },
    );
    const removeBudgetCategorySubscription = deleteBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(new Date());
        setBudget(budget);
      },
    );
    const createAccountSubscription = createAccountListener(
      async (account: AccountEntity) => {
        setAccounts([...accounts, account]);
      },
    );
    const createTransactionSubscription = createTransactionListener(
      async (transaction: TransactionEntity) => {
        setTransactions([...transactions, transaction]);
      },
    );
    const updateTransactionSubscription = updateTransactionListener(
      async (transaction: TransactionEntity) => {
        const updatedTransactions = transactions.map((t) => {
          if (t.id === transaction.id) {
            return transaction;
          }
          return t;
        });
        setTransactions(updatedTransactions);
        // updating transaction budget category requires budget update
        const budget = await getBudgetForDate(new Date());
        setBudget(budget);
      },
    );
    App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        setToggleListeners(!toggleListeners);
      }
    });
    return () => {
      unsubscribeListener(createAccountSubscription);
      unsubscribeListener(createBudgetCategorySubscription);
      unsubscribeListener(updateBudgetCategorySubscription);
      unsubscribeListener(removeBudgetCategorySubscription);
      unsubscribeListener(createTransactionSubscription);
      unsubscribeListener(updateTransactionSubscription);
      App.removeAllListeners();
    };
  }, [user, budget, transactions, accounts, toggleListeners]);

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
            content: <BudgetPage transactions={transactions} budget={budget} />,
          },
          {
            label: "Accounts",
            value: "Accounts",
            content: (
              <AccountsPage
                accounts={accounts}
                transactions={transactions}
                user={user}
              />
            ),
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
