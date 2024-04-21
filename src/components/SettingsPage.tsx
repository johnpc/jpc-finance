import { AccountSettings, Button, Card, Divider } from "@aws-amplify/ui-react";
import SignOutButton from "./Settings/SignOutButton";
import { BudgetEntity, updateTransaction } from "../data/entity";

export default function SettingsPage(props: { budget: BudgetEntity }) {
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

  return (
    <Card>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <SignOutButton />
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => onResetBudget(props.budget)}
      >
        Reset Budget
      </Button>
    </Card>
  );
}
