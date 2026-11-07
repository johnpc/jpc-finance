import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useAuth } from "./useAuthHook";
import { useDate } from "./useDateHook";
import { useError } from "./useErrorHook";
import { usePlaidReauth } from "./usePlaidReauth";
import { queryKeys } from "../lib/queryKeys";
import { formatSyncDate, resolveSyncDate } from "../lib/dateUtils";
import {
  connectionsNeedingReauth,
  PlaidSyncResult,
  syncErrorSummary,
  syncSummary,
} from "../lib/plaidSync";
import { syncPlaid } from "../api/plaid";
import {
  fetchPlaidConnections,
  recordEmptyPlaidSync,
} from "../api/plaidConnections";

/** Shared so any view can show "syncing" no matter which component started it. */
export const SYNC_MUTATION_KEY = ["syncTransactions"];

/**
 * Pull new transactions from every linked bank via the Plaid Lambda.
 * Non-blocking: the budget stays usable, new rows stream in through the
 * Transaction subscription, and the outcome lands in Sync History.
 */
export function useSyncTransactions() {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { date } = useDate();
  const { showError, showInfo, showSuccess } = useError();
  const { setIds: setReauthIds } = usePlaidReauth();

  return useMutation({
    mutationKey: SYNC_MUTATION_KEY,
    retry: false,
    mutationFn: async (): Promise<PlaidSyncResult> => {
      if (!user) throw new Error("Not signed in");
      const startedAt = new Date();
      const connections = await fetchPlaidConnections(client, user.userId);
      queryClient.setQueryData(queryKeys.plaidConnections(), connections);
      if (!connections.length) {
        await recordEmptyPlaidSync(client, user.userId, startedAt);
        return { newTransactionCount: 0, errors: [] };
      }
      const result = await syncPlaid({
        accessTokens: connections.map((c) => c.accessToken),
        owner: user.userId,
        date: formatSyncDate(resolveSyncDate(date, startedAt)),
      });
      setReauthIds(connectionsNeedingReauth(result, connections));
      return result;
    },
    onSuccess: (result) => {
      const problem = syncErrorSummary(result);
      if (problem) showError(problem);
      else if (result.newTransactionCount > 0) showSuccess(syncSummary(result));
      else showInfo(syncSummary(result));
    },
    onError: (error) => showError(`Sync failed: ${error.message}`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.syncHistory() });
    },
  });
}
