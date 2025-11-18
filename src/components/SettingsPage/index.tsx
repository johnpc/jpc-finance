import { AccountSettings, Button, Card, Divider, Heading, Text, useTheme } from "@aws-amplify/ui-react";
import { LocalNotifications, Weekday } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useDate } from "../../hooks/useDate";
import { useBudget } from "../../hooks/useBudget";
import { useAmplifyClient } from "../../hooks/useAmplifyClient";
import SignOutButton from "./SignOutButton";

export default function SettingsPage() {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const { date } = useDate();
  const { data: budget } = useBudget(date);
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  const handleSuccess = () => alert("success!");

  const onResetBudget = async () => {
    if (!budget) return;
    const promises = budget.budgetCategories.map(async (category) => {
      const promises = category.transactions.map((transaction) =>
        client.models.Transaction.update({ id: transaction.id, budgetCategoryTransactionsId: null })
      );
      await Promise.all(promises);
    });
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ["budget"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const onSetupNotifications = async () => {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Update your budget",
          body: "Time to categorize your transactions for the week",
          id: 13,
          schedule: { allowWhileIdle: true, on: { weekday: Weekday.Friday, hour: 13 } },
        },
      ],
    });
  };

  return (
    <Card>
      <Heading>{user?.signInDetails?.loginId}</Heading>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <SignOutButton />
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      {Capacitor.getPlatform() === "ios" && (
        <Button
          isFullWidth
          variation="primary"
          marginBottom={tokens.space.small}
          colorTheme="info"
          onClick={onSetupNotifications}
        >
          Setup Notifications
        </Button>
      )}
      {budget && (
        <>
          <Button isFullWidth variation="primary" onClick={onResetBudget}>
            Reset Budget
          </Button>
          <Text fontSize="xs" as="p">
            This will uncategorize all transactions for the month in case you'd like to recategorize everything.
          </Text>
        </>
      )}
    </Card>
  );
}
