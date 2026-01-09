import { useAuth } from "./useAuthHook";
import { client, publicClient } from "../lib/amplify-client";

export function useAmplifyClient() {
  const { user, isLoading } = useAuth();
  if (isLoading) return publicClient;
  return user ? client : publicClient;
}
