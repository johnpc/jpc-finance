import {
  AccountSettings,
  Card,
  Divider,
  Heading,
  Text,
} from "@aws-amplify/ui-react";
import { useAuth } from "../../hooks/useAuthHook";
import { useError } from "../../hooks/useErrorHook";
import LinkedBanks from "./LinkedBanks";
import SyncHistory from "./SyncHistory";
import ResetBudget from "./ResetBudget";
import SignOutButton from "./SignOutButton";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showSuccess } = useError();

  return (
    <>
      <LinkedBanks />
      <SyncHistory />
      <ResetBudget />
      <Card variation="outlined">
        <Heading level={5}>Account</Heading>
        <Text color="font.tertiary" marginBottom="1rem">
          {user?.signInDetails?.loginId}
        </Text>
        <SignOutButton />
        <Divider marginTop="1rem" marginBottom="1rem" />
        <AccountSettings.ChangePassword
          onSuccess={() => showSuccess("Password changed")}
        />
        <Divider marginTop="1rem" marginBottom="1rem" />
        <AccountSettings.DeleteUser />
      </Card>
    </>
  );
}
