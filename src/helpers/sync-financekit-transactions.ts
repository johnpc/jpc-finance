import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import { JPCFinanceKit } from "@johnpc/financekit-capacitor";
import { endOfMonth, subMonths } from "date-fns";

const client = generateClient<Schema>();

type FinanceKitTransaction = {
  id: string;
  amount: number;
  merchantName: string;
  date: number;
  status: number;
  description: string;
  type: number;
};

const dateToString = (date: Date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
};

const syncTransactions = async (
  financeKitTransactions: FinanceKitTransaction[],
  date: Date,
) => {
  const user = await getCurrentUser();
  const transactions = financeKitTransactions
    .sort(
      (a: FinanceKitTransaction, b: FinanceKitTransaction) => b.date - a.date,
    )
    .map((financeKitTransaction: FinanceKitTransaction) => {
      if (financeKitTransaction.type === 3) {
        return {
          ...financeKitTransaction,
          amount: financeKitTransaction.amount * -1,
          merchantName: "Payment to Apple Card",
          description: "Payment to Apple Card",
        };
      }
      return financeKitTransaction;
    })
    .filter((financeKitTransaction: FinanceKitTransaction) => {
      if (!financeKitTransaction.merchantName) {
        return false;
      }

      const lastMonth = endOfMonth(subMonths(date, 1));
      return financeKitTransaction.date >= lastMonth.getTime() / 1000;
    })
    .map((financeKitTransaction: FinanceKitTransaction) => ({
      amount: Math.floor(+financeKitTransaction.amount * 100 * -1),
      transactionMonth: new Date(
        financeKitTransaction.date * 1000,
      ).toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" }),
      date: dateToString(new Date(financeKitTransaction.date * 1000)),
      name: financeKitTransaction.description,
      pending: false,
      financeKitTransactionId: financeKitTransaction.id,
      owner: user.userId,
    }));
  console.log({ transactionsLength: transactions.length });
  for (const transaction of transactions) {
    const existingTransactions =
      await client.models.Transaction.listTransactionByFinanceKitTransactionId({
        financeKitTransactionId: transaction.financeKitTransactionId,
      });
    console.log({ existingTransactions, errors: existingTransactions.errors });
    const existingTransaction = existingTransactions.data?.find(
      (t: Schema["Transaction"]["type"]) => t,
    );
    if (!existingTransaction) {
      const created = await client.models.Transaction.create({
        ...transaction,
      });
      console.log({ created, errors: created.errors });
    } else {
      const updated = await client.models.Transaction.update({
        ...transaction,
        id: existingTransaction.id,
        budgetCategoryTransactionsId: undefined,
      });
      console.log({ updated, errors: updated.errors });
    }
  }
  return transactions;
};

export const syncFinanceKitTransactions = async (date: Date) => {
  try {
    const financeKitTransactions = await JPCFinanceKit.transactions();
    console.log({ financeKitTransactions: financeKitTransactions.value });
    await syncTransactions(financeKitTransactions.value, date);
  } catch (e) {
    console.log(e);
    console.error((e as Error).message);
  }
};
