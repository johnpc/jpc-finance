import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/amplify-client";
import { useAuth } from "../hooks/useAuthHook";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const budgetSub = client.models.Budget.onCreate().subscribe({
      next: () => queryClient.invalidateQueries({ queryKey: ["budget"] }),
    });

    const categorySub = client.models.BudgetCategory.onCreate().subscribe({
      next: () => queryClient.invalidateQueries({ queryKey: ["budget"] }),
    });

    const categoryUpdateSub = client.models.BudgetCategory.onUpdate().subscribe(
      {
        next: () => queryClient.invalidateQueries({ queryKey: ["budget"] }),
      },
    );

    const categoryDeleteSub = client.models.BudgetCategory.onDelete().subscribe(
      {
        next: () => queryClient.invalidateQueries({ queryKey: ["budget"] }),
      },
    );

    const transactionSub = client.models.Transaction.onCreate().subscribe({
      next: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budget"] });
      },
    });

    const transactionUpdateSub = client.models.Transaction.onUpdate().subscribe(
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          queryClient.invalidateQueries({ queryKey: ["budget"] });
        },
      },
    );

    const accountSub = client.models.Account.onCreate().subscribe({
      next: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    });

    const settingsSub = client.models.Settings.onCreate().subscribe({
      next: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
    });

    const settingsUpdateSub = client.models.Settings.onUpdate().subscribe({
      next: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
    });

    return () => {
      budgetSub.unsubscribe();
      categorySub.unsubscribe();
      categoryUpdateSub.unsubscribe();
      categoryDeleteSub.unsubscribe();
      transactionSub.unsubscribe();
      transactionUpdateSub.unsubscribe();
      accountSub.unsubscribe();
      settingsSub.unsubscribe();
      settingsUpdateSub.unsubscribe();
    };
  }, [user, queryClient]);

  return <>{children}</>;
}
