import { useBudget } from "./useBudget";
import { useDate } from "./useDateHook";
import { usePlaidLinkFlow } from "./usePlaidLinkFlow";
import { useSelection } from "./useSelection";
import { useTransactions } from "./useTransactions";

/** Accounts tab: the viewed month's transactions and the link-a-bank action. */
export function useAccountsPage() {
  const { date } = useDate();
  const { data: transactions = [] } = useTransactions(date);
  const { data: budget } = useBudget(date);
  const selection = useSelection(transactions);
  const { startLink, isBusy } = usePlaidLinkFlow();

  return {
    date,
    transactions,
    categories: budget?.categories ?? [],
    selection,
    startLink,
    isBusy,
  };
}
