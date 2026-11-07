import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuthHook";
import { useError } from "./useErrorHook";
import { usePlaidReauth } from "./usePlaidReauth";
import { removePlaidItem } from "../api/plaid";
import { queryKeys } from "../lib/queryKeys";
import { bankDisplayName } from "../lib/plaidSync";
import { PlaidConnection } from "../lib/types";

/**
 * Unlink a bank: the backend revokes the Plaid item (stopping Plaid billing)
 * and deletes the authorization. Existing transactions are kept.
 */
export function useUnlinkBank() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showError, showSuccess } = useError();
  const { markFixed } = usePlaidReauth();
  const key = queryKeys.plaidConnections();

  return useMutation({
    retry: false,
    mutationFn: async (connection: PlaidConnection) => {
      if (!user) throw new Error("Not signed in");
      await removePlaidItem(user.userId, connection.id);
    },
    onMutate: (connection) =>
      queryClient.setQueryData<PlaidConnection[]>(key, (old) =>
        old?.filter((c) => c.id !== connection.id),
      ),
    onSuccess: (_, connection) => {
      markFixed(connection.id);
      showSuccess(`Unlinked ${bankDisplayName(connection)}`);
    },
    onError: (error) => showError(`Couldn't unlink: ${error.message}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
