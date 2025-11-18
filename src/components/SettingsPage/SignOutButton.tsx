import { Button } from "@aws-amplify/ui-react";
import { useAuth } from "../../hooks/useAuth";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return <Button onClick={signOut}>Sign Out</Button>;
}
