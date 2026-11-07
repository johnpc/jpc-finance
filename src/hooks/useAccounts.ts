import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { AccountEntity } from "../lib/types";
import { queryKeys } from "../lib/queryKeys";
import { fetchAllPages } from "../lib/amplify-types";

/** Plaid-linked accounts. Legacy Teller accounts are hidden — Teller is retired. */
export function useAccounts() {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: queryKeys.accounts(),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<AccountEntity[]> => {
      const rows = await fetchAllPages({}, (params) =>
        client.models.Account.list(params),
      );
      return rows
        .filter((a) => !a.tellerioAccountId)
        .map((a) => ({
          id: a.id,
          name: a.name,
          institutionName: a.institutionName,
          type: a.type,
          subType: a.subType,
          lastFour: a.lastFour,
        }))
        .sort((a, b) => a.institutionName.localeCompare(b.institutionName));
    },
  });
}
