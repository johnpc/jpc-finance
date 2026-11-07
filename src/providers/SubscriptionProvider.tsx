import { ReactNode, useEffect, useMemo } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/amplify-client";
import { useAuth } from "../hooks/useAuthHook";
import { queryKeys } from "../lib/queryKeys";
import { debounce } from "../lib/debounce";
import { DEBOUNCE_TIMES } from "../lib/constants";

/**
 * Realtime: refetch the affected queries when rows change on any device
 * (including transactions streaming in from a sync in progress). Debounced so
 * a burst of synced rows triggers one refetch, not hundreds.
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidators = useMemo(() => {
    const make = (queryKey: QueryKey) =>
      debounce(
        () => queryClient.invalidateQueries({ queryKey }),
        DEBOUNCE_TIMES.SUBSCRIPTION_INVALIDATION,
      );
    return {
      budgets: make(queryKeys.budgets()),
      transactions: make(queryKeys.allTransactions()),
      accounts: make(queryKeys.accounts()),
      connections: make(queryKeys.plaidConnections()),
    };
  }, [queryClient]);

  useEffect(() => {
    if (!user) return;
    const m = client.models;
    const subscriptions = [
      m.Budget.onCreate().subscribe({ next: invalidators.budgets }),
      m.BudgetCategory.onCreate().subscribe({ next: invalidators.budgets }),
      m.BudgetCategory.onUpdate().subscribe({ next: invalidators.budgets }),
      m.BudgetCategory.onDelete().subscribe({ next: invalidators.budgets }),
      m.Transaction.onCreate().subscribe({ next: invalidators.transactions }),
      m.Transaction.onUpdate().subscribe({ next: invalidators.transactions }),
      m.Account.onCreate().subscribe({ next: invalidators.accounts }),
      m.PlaidAuthorization.onCreate().subscribe({
        next: invalidators.connections,
      }),
      m.PlaidAuthorization.onDelete().subscribe({
        next: invalidators.connections,
      }),
    ];
    return () => subscriptions.forEach((s) => s.unsubscribe());
  }, [user, invalidators]);

  return <>{children}</>;
}
