import { Button, Loader, Tabs, Text } from "@aws-amplify/ui-react";
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
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { addMonths, subMonths } from "date-fns";
export default function TabsView() {
  const [toggleListeners, setToggleListeners] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [budget, setBudget] = useState<BudgetEntity>();
  const [user, setUser] = useState<AuthUser>();
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const setup = async () => {
      const budget = await getBudgetForDate(date);
      setBudget(budget);
      const transactions = await listTransactions(date);
      setTransactions(transactions);
      const accounts = await listAccounts();
      setAccounts(accounts);
      const user = await getCurrentUser();
      setUser(user);
    };

    setup();
  }, [date]);

  useEffect(() => {
    const createBudgetCategorySubscription = createBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(date);
        setBudget(budget);
      },
    );
    const updateBudgetCategorySubscription = updateBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(date);
        setBudget(budget);
      },
    );
    const removeBudgetCategorySubscription = deleteBudgetCategoryListener(
      async () => {
        const budget = await getBudgetForDate(date);
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
        const budget = await getBudgetForDate(date);
        setBudget(budget);
      },
    );
    App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        setToggleListeners(!toggleListeners);
      }
    });
    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      const slug = event.url.split(".app").pop();
      if (slug) {
        console.log({ slug });
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
  }, [date, user, budget, transactions, accounts, toggleListeners]);

  const handleSubtractDate = async () => {
    const day = subMonths(date, 1);
    setDate(day);
  };
  const handleAddDate = async () => {
    const day = addMonths(date, 1);
    setDate(day);
  };

  if (!budget || !user) return <Loader variation="linear" />;
  const dateLocaleString = date.toLocaleString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const nowLocaleString = new Date().toLocaleString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <>
      <>
        <Text as="div" textAlign={"center"}>
          <ArrowBackIos
            style={{ paddingTop: "10px" }}
            onClick={handleSubtractDate}
          />
          <Text as="span" fontWeight={"bold"} margin={"15%"}>
            {dateLocaleString}
          </Text>
          {dateLocaleString === nowLocaleString ? null : (
            <ArrowForwardIos
              style={{ paddingTop: "10px" }}
              onClick={handleAddDate}
            />
          )}

          {dateLocaleString === nowLocaleString ? null : (
            <Button onClick={() => setDate(new Date())}>today</Button>
          )}
        </Text>
      </>
      <Tabs
        spacing="equal"
        justifyContent="space-between"
        defaultValue="Budget"
        items={[
          {
            label: "Budget",
            value: "Budget",
            content: (
              <BudgetPage
                accounts={accounts}
                transactions={transactions}
                budget={budget}
                date={date}
              />
            ),
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
            content: <SettingsPage user={user} budget={budget} />,
          },
        ]}
      />
    </>
  );
}
