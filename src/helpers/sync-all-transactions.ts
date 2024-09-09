import { Capacitor } from "@capacitor/core";
import { syncPlaidTransactions } from "./plaid";
import { syncTellerioTransactions } from "./sync-tellerio-transactions";
import { syncFinanceKitTransactions } from "./sync-financekit-transactions";
import { SettingsEntity } from "../data/entity";

export const syncAllTransactions = async (
  date: Date,
  settings?: SettingsEntity,
): Promise<void> => {
  const promises = [
    syncTellerioTransactions(date),
    syncPlaidTransactions(date),
  ];
  if (Capacitor.getPlatform() === "ios" && settings?.enableFinanceKit) {
    promises.push(syncFinanceKitTransactions(date));
  }
  await Promise.all(promises);
};
