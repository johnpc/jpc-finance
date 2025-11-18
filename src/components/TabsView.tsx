import { Button, Loader, Tabs, Text } from "@aws-amplify/ui-react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { addMonths, subMonths } from "date-fns";
import BudgetPage from "./BudgetPage/index";
import AccountsPage from "./AccountsPage/index";
import SettingsPage from "./SettingsPage/index";
import { useBudget } from "../hooks/useBudget";
import { useDate } from "../hooks/useDate";
import { useAuth } from "../hooks/useAuth";

export default function TabsView() {
  const { date, setDate } = useDate();
  const { user } = useAuth();
  const { data: budget, isLoading: budgetLoading } = useBudget(date);

  const dateLocaleString = date.toLocaleString(undefined, { month: "2-digit", year: "2-digit" });
  const nowLocaleString = new Date().toLocaleString(undefined, { month: "2-digit", year: "2-digit" });

  if (budgetLoading && !budget) return <Loader variation="linear" />;
  if (!user) return <Loader variation="linear" />;

  return (
    <>
      <Text as="div" textAlign="center">
        <ArrowBackIos style={{ paddingTop: "10px" }} onClick={() => setDate(subMonths(date, 1))} />
        <Text as="span" fontWeight="bold" margin="15%">{dateLocaleString}</Text>
        {dateLocaleString !== nowLocaleString && (
          <>
            <ArrowForwardIos style={{ paddingTop: "10px" }} onClick={() => setDate(addMonths(date, 1))} />
            <Button onClick={() => setDate(new Date())}>today</Button>
          </>
        )}
      </Text>
      <Tabs
        spacing="equal"
        justifyContent="space-between"
        defaultValue="Budget"
        items={[
          { label: "Budget", value: "Budget", content: <BudgetPage /> },
          { label: "Accounts", value: "Accounts", content: <AccountsPage /> },
          { label: "Settings", value: "Settings", content: <SettingsPage /> },
        ]}
      />
    </>
  );
}
