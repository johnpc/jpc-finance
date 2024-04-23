import { generateClient } from "aws-amplify/api";
import config from "../../amplifyconfiguration.json";
import { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import { Subscription } from "rxjs";
import { getCurrentUser } from "aws-amplify/auth";
import { subMonths } from "date-fns";

Amplify.configure(config);
const client = generateClient<Schema>();

export type TransactionEntity = {
  id: string;
  amount: number;
  transactionMonth: string;
  date: Date;
  name: string;
  pending: boolean;
  deleted?: boolean;
  budgetCategoryId?: string | null;
};

export type AccountEntity = {
  id: string;
  name: string;
  institutionName: string;
  type: string;
  subType: string;
  lastFour?: number | null;
  tellerioAccountId?: string;
};

export type BudgetCategoryEntity = {
  id: string;
  name: string;
  type: "Saving" | "Needs" | "Wants" | "Income";
  transactions: TransactionEntity[];
  plannedAmount: number;
};

export type BudgetEntity = {
  id: string;
  budgetMonth: string;
  budgetCategories: BudgetCategoryEntity[];
};

const hydrateAccount = (account: Schema["Account"]): AccountEntity => {
  return {
    ...account,
    tellerioAccountId: account.id,
  };
};
const hydrateTransaction = (
  transaction: Schema["Transaction"],
): TransactionEntity => {
  return {
    ...transaction,
    amount: transaction.amount * -1,
    deleted: transaction.deleted ? true : false,
    date: new Date(transaction.date),
    budgetCategoryId: transaction.budgetCategoryTransactionsId,
  };
};

const hydrateBudgetCategory = async (
  budgetCategory: Schema["BudgetCategory"],
): Promise<BudgetCategoryEntity> => {
  const transactions = await budgetCategory.transactions({ limit: 10000 });
  const transactionEntities = transactions.data.map((transaction) =>
    hydrateTransaction(transaction),
  );
  return {
    ...budgetCategory,
    type: budgetCategory.type as unknown as
      | "Saving"
      | "Needs"
      | "Wants"
      | "Income",
    transactions: transactionEntities,
  };
};

const hydrateBudget = async (
  budget: Schema["Budget"],
): Promise<BudgetEntity> => {
  const budgetCategories = await budget.budgetCategories({ limit: 10000 });
  const promises = (budgetCategories.data ?? []).map((budgetCategory) => {
    return hydrateBudgetCategory(
      budgetCategory as unknown as Schema["BudgetCategory"],
    );
  });
  const budgetCategoryEntities = await Promise.all(promises);
  return {
    ...budget,
    budgetCategories: budgetCategoryEntities,
  };
};

export const listAccounts = async (): Promise<AccountEntity[]> => {
  const allAccounts = await client.models.Account.list();
  return (
    allAccounts.data?.map((account: Schema["Account"]) =>
      hydrateAccount(account),
    ) ?? []
  );
};

export const listTransactions = async (
  date: Date,
): Promise<TransactionEntity[]> => {
  const transactionMonth = date.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const allTransactions =
    await client.models.Transaction.listByTransactionMonth(
      {
        transactionMonth,
      },
      { limit: 10000 },
    );
  return allTransactions.data
    .map((transaction: Schema["Transaction"]) =>
      hydrateTransaction(transaction),
    )
    .sort(
      (a: TransactionEntity, b: TransactionEntity) =>
        b.date.getTime() - a.date.getTime(),
    );
};

export const listBudgets = async (): Promise<BudgetEntity[]> => {
  const allBudgets = await client.models.Budget.list();
  const promises = allBudgets.data.map((budget: Schema["Budget"]) =>
    hydrateBudget(budget),
  );
  const budgetEntities = await Promise.all(promises);
  return budgetEntities;
};

const createDefaultBudgetForDate = async (
  date: Date,
): Promise<BudgetEntity> => {
  const budgetMonth = date.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const createdBudget = await client.models.Budget.create({
    budgetMonth,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Paycheck",
    type: "Income",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Investing",
    type: "Saving",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Housing",
    type: "Needs",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Groceries",
    type: "Needs",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Transport",
    type: "Needs",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Entertainment",
    type: "Wants",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Dining Out",
    type: "Wants",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Shopping",
    type: "Wants",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Misc",
    type: "Wants",
    plannedAmount: 0,
  });
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: createdBudget.data.id,
    name: "Giving",
    type: "Wants",
    plannedAmount: 0,
  });
  return hydrateBudget(createdBudget.data);
};

const copyBudgetForDate = async (
  budget: BudgetEntity,
  date: Date,
): Promise<BudgetEntity> => {
  const budgetMonth = date.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const createdBudget = await client.models.Budget.create({
    budgetMonth,
  });
  const createBudgetCategoryPromises = budget.budgetCategories.map(
    (budgetCategory) => {
      return client.models.BudgetCategory.create({
        budgetBudgetCategoriesId: createdBudget.data.id,
        name: budgetCategory.name,
        type: budgetCategory.type,
        plannedAmount: budgetCategory.plannedAmount,
      });
    },
  );
  await Promise.all(createBudgetCategoryPromises);
  return hydrateBudget(createdBudget.data);
};

const createBudgetForDate = async (date: Date): Promise<BudgetEntity> => {
  const lastMonth = subMonths(date, 1);
  const lastBudgetMonth = lastMonth.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const allLastMonthBudgets = await client.models.Budget.listByBudgetMonth({
    budgetMonth: lastBudgetMonth,
  });
  const budget = allLastMonthBudgets.data.find((b) => b);
  if (!budget) {
    return await createDefaultBudgetForDate(date);
  }

  return await copyBudgetForDate(await hydrateBudget(budget), date);
};

export const getBudgetForDate = async (date: Date): Promise<BudgetEntity> => {
  const budgetMonth = date.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "2-digit",
  });
  const allBudgets = await client.models.Budget.listByBudgetMonth({
    budgetMonth,
  });
  const budget = allBudgets.data.find((b) => b);
  if (!budget) {
    return await createBudgetForDate(date);
  }
  return await hydrateBudget(budget);
};

export const createBudgetCategory = async (
  budget: BudgetEntity,
  type: "Saving" | "Needs" | "Wants" | "Income",
  name: string,
) => {
  await client.models.BudgetCategory.create({
    budgetBudgetCategoriesId: budget.id,
    name,
    type,
    plannedAmount: 10000,
  });
};

export const updateBudgetCategory = async (
  budgetCategory: BudgetCategoryEntity,
) => {
  await client.models.BudgetCategory.update({
    id: budgetCategory.id,
    name: budgetCategory.name,
    plannedAmount: budgetCategory.plannedAmount || 0,
  });
};

export const removeBudgetCategory = async (
  budgetCategory: BudgetCategoryEntity,
) => {
  const promises = budgetCategory.transactions.map((transaction) => {
    transaction.budgetCategoryId = null;
    return updateTransaction(transaction);
  });
  await Promise.all(promises);
  await client.models.BudgetCategory.delete({
    id: budgetCategory.id,
  });
};

export const updateTransaction = async (transaction: TransactionEntity) => {
  await client.models.Transaction.update({
    id: transaction.id,
    budgetCategoryTransactionsId: transaction.budgetCategoryId as string,
  });
};

export const createBudgetCategoryListener = (fn: () => void) => {
  const listener = client.models.BudgetCategory.onCreate().subscribe({
    next: async () => {
      fn();
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const updateBudgetCategoryListener = (fn: () => void) => {
  const listener = client.models.BudgetCategory.onUpdate().subscribe({
    next: async () => {
      fn();
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const deleteBudgetCategoryListener = (fn: () => void) => {
  const listener = client.models.BudgetCategory.onDelete().subscribe({
    next: async () => {
      fn();
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const createAccountListener = (fn: (account: AccountEntity) => void) => {
  const listener = client.models.Account.onCreate().subscribe({
    next: async (account: Schema["Account"]) => {
      fn(hydrateAccount(account));
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const createTransactionListener = (
  fn: (transaction: TransactionEntity) => void,
) => {
  const listener = client.models.Transaction.onCreate().subscribe({
    next: async (transaction: Schema["Transaction"]) => {
      fn(hydrateTransaction(transaction));
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const updateTransactionListener = (
  fn: (transaction: TransactionEntity) => void,
) => {
  const listener = client.models.Transaction.onUpdate().subscribe({
    next: async (transaction: Schema["Transaction"]) => {
      fn(hydrateTransaction(transaction));
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const unsubscribeListener = (subscription: Subscription) => {
  return subscription.unsubscribe();
};

export const createTellerAuthorization = async (authorizationToken: string) => {
  const user = await getCurrentUser();
  const createdTellerAuthorization =
    await client.models.TellerAuthorization.create({
      amplifyUserId: user.userId,
      accessToken: authorizationToken,
    });
  console.log({ createdTellerAuthorization });
};
