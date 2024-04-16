import { AccountSettings, Button, Card, Divider } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";

export default function SettingsPage() {
  const handleSuccess = () => {
    alert("success!");
  };

  const onSignOut = async () => {
    await signOut();
  };

  return (
    <Card>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <Button isFullWidth={true} variation="destructive" onClick={onSignOut}>
        Sign Out
      </Button>
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
    </Card>
  );
}
