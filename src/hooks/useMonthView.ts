import { useMemo } from "react";
import { useBudget } from "./useBudget";
import { useTransactions } from "./useTransactions";
import { useDate } from "./useDateHook";
import { buildMonthView } from "../lib/budgetMath";

/** The viewed month's budget with transactions attached, plus the uncategorized tray. */
export function useMonthView() {
  const { date } = useDate();
  const budgetQuery = useBudget(date);
  const transactionsQuery = useTransactions(date);
  const budget = budgetQuery.data;
  const transactions = transactionsQuery.data;

  const view = useMemo(
    () => (budget ? buildMonthView(budget, transactions ?? []) : null),
    [budget, transactions],
  );

  return {
    view,
    isLoading: budgetQuery.isLoading,
  };
}
