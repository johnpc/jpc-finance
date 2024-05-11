import { syncPlaidTransactions } from "./plaid";
import { syncTellerioTransactions } from "./sync-tellerio-transactions";
import { syncFinanceKitTransactions } from "./sync-financekit-transactions";

export const syncAllTransactions = async (date: Date) => {
  return await Promise.all([
    syncFinanceKitTransactions(date),
    syncTellerioTransactions(date),
    syncPlaidTransactions(date),
  ]);
};
