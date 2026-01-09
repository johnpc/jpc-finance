import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { AccountEntity } from "../lib/types";

export function useAccounts() {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["accounts"],
    staleTime: 1000 * 60 * 5, // 5 minutes - accounts change less frequently
    gcTime: 1000 * 60 * 15, // 15 minutes
    queryFn: async (): Promise<AccountEntity[]> => {
      const response = await client.models.Account.list();
      return response.data.map((a) => ({ ...a, tellerioAccountId: a.id }));
    },
  });
}
