import { ReactNode, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/amplify-client";
import { useAuth } from "../hooks/useAuthHook";
import { queryKeys } from "../lib/queryKeys";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  useEffect(() => {
    if (!user) return;

    subscriptionsRef.current = [
      client.models.Budget.onCreate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() }),
      }),
      client.models.BudgetCategory.onCreate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() }),
      }),
      client.models.BudgetCategory.onUpdate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() }),
      }),
      client.models.BudgetCategory.onDelete().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() }),
      }),
      client.models.Transaction.onCreate().subscribe({
        next: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.allTransactions(),
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
        },
      }),
      client.models.Transaction.onUpdate().subscribe({
        next: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.allTransactions(),
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
        },
      }),
      client.models.Account.onCreate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts() }),
      }),
      client.models.Settings.onCreate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.settings() }),
      }),
      client.models.Settings.onUpdate().subscribe({
        next: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.settings() }),
      }),
    ];

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [user, queryClient]);

  return <>{children}</>;
}
