import {
  AccountSettings,
  Button,
  Card,
  Divider,
  Heading,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import SignOutButton from "./Settings/SignOutButton";
import {
  BudgetEntity,
  SettingsEntity,
  updateTransaction,
} from "../data/entity";
import { AuthUser } from "aws-amplify/auth";
import { LocalNotifications, Weekday } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export default function SettingsPage(props: {
  budget: BudgetEntity | undefined;
  user: AuthUser;
  settings?: SettingsEntity;
}) {
  const { tokens } = useTheme();
  const handleSuccess = () => {
    alert("success!");
  };

  const onResetBudget = async (budget: BudgetEntity) => {
    const promises = budget.budgetCategories.map(async (category) => {
      const promises = category.transactions.map((transaction) => {
        transaction.budgetCategoryId = null;
        return updateTransaction(transaction);
      });
      await Promise.all(promises);
    });
    await Promise.all(promises);
  };

  const onSetupNotifications = async () => {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Update your budget",
          body: "Time to categorize your transactions for the week",
          id: 13,
          schedule: {
            allowWhileIdle: true,
            on: {
              weekday: Weekday.Friday,
              hour: 13,
            },
          },
        },
      ],
    });
  };

  return (
    <Card>
      <Heading>{props.user.signInDetails?.loginId}</Heading>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <SignOutButton />
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      {Capacitor.getPlatform() !== "ios" ? null : (
        <Button
          isFullWidth={true}
          variation="primary"
          marginBottom={tokens.space.small}
          colorTheme="info"
          onClick={() => onSetupNotifications()}
        >
          Setup Notifications
        </Button>
      )}
      {props.budget ? (
        <Button
          isFullWidth={true}
          variation="primary"
          onClick={() => onResetBudget(props.budget!)}
        >
          Reset Budget
        </Button>
      ) : null}
      <Text fontSize={"xs"} as="p">
        This will uncategorize all transactions for the month in case you'd like
        to recategorize everything.
      </Text>
    </Card>
  );
}
