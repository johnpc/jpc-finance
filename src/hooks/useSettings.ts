import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { SettingsEntity } from "../lib/types";

export function useSettings() {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["settings"],
    staleTime: 1000 * 60 * 10, // 10 minutes - settings rarely change
    gcTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async (): Promise<SettingsEntity> => {
      const response = await client.models.Settings.list();
      if (response.data?.length) {
        return {
          id: response.data[0].id,
          enableFinanceKit: response.data[0].enableFinanceKit ?? false,
        };
      }
      const created = await client.models.Settings.create({
        enableFinanceKit: false,
      });
      return { id: created.data!.id, enableFinanceKit: false };
    },
  });
}
