import { syncPlaidTransactions } from "./plaid";
import { syncTellerioTransactions } from "./sync-tellerio-transactions";

export const syncAllTransactions = async (date: Date) => {
  return await Promise.all([
    syncTellerioTransactions(date),
    syncPlaidTransactions(date),
  ]);
};
