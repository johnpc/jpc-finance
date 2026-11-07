import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { readJson, toggleInList, writeJson } from "../lib/browserStorage";

const STORAGE_KEY = "plaid.needsReauth";

/**
 * Ids of bank connections whose login expired (ITEM_LOGIN_REQUIRED), as
 * reported by the most recent sync. Persisted so the warning survives a
 * reload; every sync replaces the set, so it self-heals.
 */
export function usePlaidReauth() {
  const queryClient = useQueryClient();
  const { data: ids = [] } = useQuery({
    queryKey: queryKeys.plaidReauth(),
    queryFn: () => readJson<string[]>(STORAGE_KEY, []),
    staleTime: Infinity,
  });

  const setIds = useCallback(
    (next: string[]) => {
      writeJson(STORAGE_KEY, next);
      queryClient.setQueryData(queryKeys.plaidReauth(), next);
    },
    [queryClient],
  );

  const markFixed = useCallback(
    (connectionId: string) => {
      const current =
        queryClient.getQueryData<string[]>(queryKeys.plaidReauth()) ?? [];
      setIds(toggleInList(current, connectionId, false));
    },
    [queryClient, setIds],
  );

  return { ids, setIds, markFixed };
}
