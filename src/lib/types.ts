import { Schema } from "../../amplify/data/resource";

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

export type SettingsEntity = {
  id: string;
  enableFinanceKit: boolean;
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

export type SchemaTransaction = Schema["Transaction"]["type"];
export type SchemaAccount = Schema["Account"]["type"];
export type SchemaSettings = Schema["Settings"]["type"];
export type SchemaBudgetCategory = Schema["BudgetCategory"]["type"];
