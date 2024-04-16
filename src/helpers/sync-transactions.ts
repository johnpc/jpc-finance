import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import config from "../../amplifyconfiguration.json";
import { dateToString } from "./date-to-string";

const client = generateClient<Schema>();

type PlaidTransaction = {
  amount: number;
  authorized_date: string;
  date: string;
  merchant_name?: string;
  name?: string;
  website: string;
  pending: boolean;
  transaction_id: string;
};

export const syncTransactions = async () => {
  const fetchResult = await fetch(config.custom.plaidGetBalanceFunction);
  const json = await fetchResult.json();
  const transactions = json.transactions.transactions.map(
    (plaidTransaction: PlaidTransaction) => ({
      amount: Math.floor(plaidTransaction.amount * 100),
      transactionMonth: new Date(
        plaidTransaction.authorized_date,
      ).toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" }),
      authorizedDate: dateToString(new Date(plaidTransaction.authorized_date)),
      date: dateToString(new Date(plaidTransaction.date)),
      name:
        plaidTransaction.merchant_name ||
        plaidTransaction.name ||
        plaidTransaction.website,
      pending: plaidTransaction.pending,
      plaidTransactionId: plaidTransaction.transaction_id,
    }),
  );

  for (const transaction of transactions) {
    const existingTransactions =
      await client.models.Transaction.listByPlaidTransactionId({
        plaidTransactionId: transaction.plaidTransactionId,
      });
    const existingTransaction = existingTransactions.data?.find((t) => t);
    if (existingTransaction) {
      const updated = await client.models.Transaction.update({
        ...transaction,
        id: existingTransaction.id,
        budgetCategoryTransactionsId: undefined,
      });
      console.log({ updated, errors: updated.errors });
    } else {
      const created = await client.models.Transaction.create({
        ...transaction,
      });
      console.log({ created, errors: created.errors });
    }
  }
};
