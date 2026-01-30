import { Button, Loader, Tabs, Text } from "@aws-amplify/ui-react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { addMonths, subMonths } from "date-fns";
import { lazy, Suspense } from "react";
import { useDate } from "../hooks/useDateHook";
import { useAuth } from "../hooks/useAuthHook";

const BudgetPage = lazy(() => import("./BudgetPage/index"));
const AccountsPage = lazy(() => import("./AccountsPage/index"));
const SettingsPage = lazy(() => import("./SettingsPage/index"));

export default function TabsView() {
  const { date, setDate } = useDate();
  const { user } = useAuth();

  const dateLocaleString = date.toLocaleString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const nowLocaleString = new Date().toLocaleString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });

  if (!user) return <Loader variation="linear" />;

  return (
    <>
      <Text as="div" textAlign="center">
        <ArrowBackIos
          style={{ paddingTop: "10px" }}
          onClick={() => setDate(subMonths(date, 1))}
        />
        <Text as="span" fontWeight="bold" margin="15%">
          {dateLocaleString}
        </Text>
        <ArrowForwardIos
          style={{ paddingTop: "10px" }}
          onClick={() => setDate(addMonths(date, 1))}
        />
        {dateLocaleString !== nowLocaleString && (
          <Button onClick={() => setDate(new Date())}>today</Button>
        )}
      </Text>
      <Tabs
        spacing="equal"
        justifyContent="space-between"
        defaultValue="Budget"
        items={[
          {
            label: "Budget",
            value: "Budget",
            content: (
              <Suspense fallback={<Loader variation="linear" />}>
                <BudgetPage />
              </Suspense>
            ),
          },
          {
            label: "Accounts",
            value: "Accounts",
            content: (
              <Suspense fallback={<Loader variation="linear" />}>
                <AccountsPage />
              </Suspense>
            ),
          },
          {
            label: "Settings",
            value: "Settings",
            content: (
              <Suspense fallback={<Loader variation="linear" />}>
                <SettingsPage />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
}
