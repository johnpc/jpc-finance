import { AccountSettings, Card, Divider } from "@aws-amplify/ui-react";
import SignOutButton from "./Settings/SignOutButton";

export default function SettingsPage() {
  const handleSuccess = () => {
    alert("success!");
  };

  return (
    <Card>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <SignOutButton />
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
    </Card>
  );
}
