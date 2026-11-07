import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { useAuth } from "./useAuthHook";
import { SyncRunEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";

const HISTORY_LIMIT = 20;

/**
 * Recent sync runs, newest first. Plaid runs are written by the Lambda and
 * Apple Card runs by the iOS app, all owned by the plain user id, so one
 * query returns the merged history.
 */
export function useSyncHistory() {
  const client = useAmplifyClient();
  const { user } = useAuth();
  const owner = user?.userId;

  return useQuery({
    queryKey: queryKeys.syncHistory(),
    enabled: !!owner,
    queryFn: async (): Promise<SyncRunEntity[]> => {
      if (!owner) return [];
      const response = await client.models.SyncRun.listSyncRunByOwner(
        { owner },
        { sortDirection: "DESC", limit: HISTORY_LIMIT },
      );
      return response.data.map((r) => ({
        id: r.id,
        source: r.source,
        startedAt: r.startedAt,
        durationMs: r.durationMs,
        newTransactionCount: r.newTransactionCount,
        error: r.error,
      }));
    },
  });
}
