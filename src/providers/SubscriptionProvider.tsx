import { ReactNode, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/amplify-client";
import { useAuth } from "../hooks/useAuthHook";
import { queryKeys } from "../lib/queryKeys";
import { debounce } from "../lib/debounce";
import { DEBOUNCE_TIMES } from "../lib/constants";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  const debouncedInvalidateBudgets = useMemo(
    () =>
      debounce(
        () => queryClient.invalidateQueries({ queryKey: queryKeys.budgets() }),
        DEBOUNCE_TIMES.SUBSCRIPTION_INVALIDATION,
      ),
    [queryClient],
  );

  const debouncedInvalidateTransactions = useMemo(
    () =>
      debounce(
        () =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.allTransactions(),
          }),
        DEBOUNCE_TIMES.SUBSCRIPTION_INVALIDATION,
      ),
    [queryClient],
  );

  const debouncedInvalidateAccounts = useMemo(
    () =>
      debounce(
        () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts() }),
        DEBOUNCE_TIMES.SUBSCRIPTION_INVALIDATION,
      ),
    [queryClient],
  );

  const debouncedInvalidateSettings = useMemo(
    () =>
      debounce(
        () => queryClient.invalidateQueries({ queryKey: queryKeys.settings() }),
        DEBOUNCE_TIMES.SUBSCRIPTION_INVALIDATION,
      ),
    [queryClient],
  );

  useEffect(() => {
    if (!user) return;

    subscriptionsRef.current = [
      client.models.Budget.onCreate().subscribe({
        next: debouncedInvalidateBudgets,
      }),
      client.models.BudgetCategory.onCreate().subscribe({
        next: debouncedInvalidateBudgets,
      }),
      client.models.BudgetCategory.onUpdate().subscribe({
        next: debouncedInvalidateBudgets,
      }),
      client.models.BudgetCategory.onDelete().subscribe({
        next: debouncedInvalidateBudgets,
      }),
      client.models.Transaction.onCreate().subscribe({
        next: () => {
          debouncedInvalidateTransactions();
          debouncedInvalidateBudgets();
        },
      }),
      client.models.Transaction.onUpdate().subscribe({
        next: () => {
          debouncedInvalidateTransactions();
          debouncedInvalidateBudgets();
        },
      }),
      client.models.Account.onCreate().subscribe({
        next: debouncedInvalidateAccounts,
      }),
      client.models.Settings.onCreate().subscribe({
        next: debouncedInvalidateSettings,
      }),
      client.models.Settings.onUpdate().subscribe({
        next: debouncedInvalidateSettings,
      }),
    ];

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [
    user,
    debouncedInvalidateBudgets,
    debouncedInvalidateTransactions,
    debouncedInvalidateAccounts,
    debouncedInvalidateSettings,
  ]);

  return <>{children}</>;
}
