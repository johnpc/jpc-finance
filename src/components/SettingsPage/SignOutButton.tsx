import { Button } from "@aws-amplify/ui-react";
import { useAuth } from "../../hooks/useAuthHook";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return <Button onClick={signOut}>Sign Out</Button>;
}
