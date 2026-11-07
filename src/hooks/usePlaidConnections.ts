import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useAuth } from "./useAuthHook";
import { queryKeys } from "../lib/queryKeys";
import { fetchPlaidConnections } from "../api/plaidConnections";

export function usePlaidConnections() {
  const client = useAmplifyClient();
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: queryKeys.plaidConnections(),
    enabled: !!userId,
    queryFn: () => (userId ? fetchPlaidConnections(client, userId) : []),
  });
}
