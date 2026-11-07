import { Loader, Tabs } from "@aws-amplify/ui-react";
import { ComponentType, lazy, Suspense } from "react";
import { useAuth } from "../hooks/useAuthHook";
import MonthNavigator from "./MonthNavigator";

const BudgetPage = lazy(() => import("./BudgetPage/index"));
const AccountsPage = lazy(() => import("./AccountsPage/index"));
const SettingsPage = lazy(() => import("./SettingsPage/index"));

const tab = (label: string, Page: ComponentType) => ({
  label,
  value: label,
  content: (
    <Suspense fallback={<Loader variation="linear" />}>
      <Page />
    </Suspense>
  ),
});

export default function TabsView() {
  const { user } = useAuth();
  if (!user) return <Loader variation="linear" />;

  return (
    <>
      <MonthNavigator />
      <Tabs
        spacing="equal"
        justifyContent="space-between"
        defaultValue="Budget"
        items={[
          tab("Budget", BudgetPage),
          tab("Accounts", AccountsPage),
          tab("Settings", SettingsPage),
        ]}
      />
    </>
  );
}
