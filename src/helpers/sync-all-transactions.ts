import { syncPlaidTransactions } from "./plaid";
import { syncTellerioTransactions } from "./sync-tellerio-transactions";

export const syncAllTransactions = async () => {
  return await Promise.all([
    syncTellerioTransactions(),
    syncPlaidTransactions(),
  ]);
};
