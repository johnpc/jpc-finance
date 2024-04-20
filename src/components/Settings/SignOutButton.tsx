import { Button } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";

export default function SignOutButton() {
  const onSignOut = async () => {
    await signOut();
  };

  return (
    <Button isFullWidth={true} variation="destructive" onClick={onSignOut}>
      Sign Out
    </Button>
  );
}
