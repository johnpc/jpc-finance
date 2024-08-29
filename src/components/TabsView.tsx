import { Button, Loader, Tabs, Text } from "@aws-amplify/ui-react";
import BudgetPage from "./BudgetPage";
import AccountsPage from "./AccountsPage";
import SettingsPage from "./SettingsPage";
import { useEffect, useState } from "react";
import {
  AccountEntity,
  BudgetEntity,
  SettingsEntity,
  TransactionEntity,
  createAccountListener,
  createBudgetCategoryListener,
  createSettingsListener,
  createTransactionListener,
  deleteBudgetCategoryListener,
  getBudgetForDate,
  getOrCreateSettings,
  listAccounts,
  listTransactions,
  unsubscribeListener,
  updateBudgetCategoryListener,
  updateSettingsListener,
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
  const [settings, setSettings] = useState<SettingsEntity>();
  const [user, setUser] = useState<AuthUser>();
  const [date, setDate] = useState<Date>(new Date());
  const updateTransactions = async () => {
    const transactions = await listTransactions(date);
    console.log({ transactionsToUpdate: transactions });
    setTransactions(transactions);
  };

  useEffect(() => {
    const setup = async () => {
      const updateBudget = async () => {
        const budget = await getBudgetForDate(date);
        console.log({budgetToUpdate: budget})

        setBudget(budget);
      };

      const updateAccounts = async () => {
        const accounts = await listAccounts();
        setAccounts(accounts);
      };

      const updateUser = async () => {
        const user = await getCurrentUser();
        setUser(user);
      };

      const updateSettings = async () => {
        const settings = await getOrCreateSettings();
        setSettings(settings);
      };
      await Promise.all([
        updateBudget(),
        updateTransactions(),
        updateAccounts(),
        updateUser(),
        updateSettings(),
      ]);
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

    const createSettingsSubscription = createSettingsListener(
      async (settings: SettingsEntity) => {
        setSettings(settings);
      },
    );
    const updateSettingsSubscription = updateSettingsListener(
      async (settings: SettingsEntity) => {
        setSettings(settings);
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
      unsubscribeListener(createSettingsSubscription);
      unsubscribeListener(updateSettingsSubscription);
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
                updateTransactions={updateTransactions}
                budget={budget}
                date={date}
                settings={settings}
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
                settings={settings}
              />
            ),
          },
          {
            label: "Settings",
            value: "Settings",
            content: (
              <SettingsPage settings={settings} user={user} budget={budget} />
            ),
          },
        ]}
      />
    </>
  );
}
