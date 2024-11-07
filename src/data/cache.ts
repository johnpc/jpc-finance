import { AccountEntity, BudgetEntity, TransactionEntity } from "./entity";

export const getCachedAccounts = () => {
  try {
    return localStorage.getItem("accounts")
      ? JSON.parse(localStorage.getItem("accounts")!)
      : [];
  } catch (error) {
    return [];
  }
};

export const getCachedBudgetForDate = (date: Date) => {
  try {
    return localStorage.getItem(`budget-${date.toLocaleDateString()}`)
      ? JSON.parse(localStorage.getItem(`budget-${date.toLocaleDateString()}`)!)
      : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getCachedTransactionsForDate = (date: Date) => {
  try {
    return localStorage.getItem(`transactions-${date.toLocaleDateString()}`)
      ? JSON.parse(
          localStorage.getItem(`transactions-${date.toLocaleDateString()}`)!,
        )
      : undefined;
  } catch (error) {
    return undefined;
  }
};

export const setBudgetForDateCache = (date: Date, budget: BudgetEntity) => {
  localStorage.setItem(
    `budget-${date.toLocaleDateString()}`,
    JSON.stringify(budget),
  );
};

export const setAccountsCache = (accounts: AccountEntity[]) => {
  localStorage.setItem("accounts", JSON.stringify(accounts));
};

export const setCachedTransactionsForDate = (
  date: Date,
  transactions: TransactionEntity[],
) => {
  localStorage.setItem(
    `transaction-${date.toLocaleDateString()}`,
    JSON.stringify(transactions),
  );
};
