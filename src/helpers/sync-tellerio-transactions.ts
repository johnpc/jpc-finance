import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import config from "../../amplifyconfiguration.json";
import { dateToString } from "./date-to-string";

const client = generateClient<Schema>();
type TellerIoTransaction = {
  id: string;
  amount: string;
  date: string;
  description: string;
  details: {
    processing_status: string;
  };
  status: string;
};

export const syncTellerioTransactions = async () => {
  const fetchResult = await fetch(
    config.custom.tellerioListTransactionsFunction,
  );
  const json = await fetchResult.json();
  const transactions = json.transactions
    .sort(
      (a: TellerIoTransaction, b: TellerIoTransaction) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .map((tellerioTransaction: TellerIoTransaction) => ({
      amount: Math.floor(+tellerioTransaction.amount * 100),
      transactionMonth: new Date(tellerioTransaction.date).toLocaleDateString(
        undefined,
        { month: "2-digit", year: "2-digit" },
      ),
      date: dateToString(new Date(tellerioTransaction.date)),
      name: tellerioTransaction.description,
      pending: tellerioTransaction.status === "pending",
      tellerioTransactionId: tellerioTransaction.id,
    }));

  for (const transaction of transactions) {
    const existingTransactions =
      await client.models.Transaction.listByTellerioTransactionId({
        tellerioTransactionId: transaction.id,
      });
    const existingTransaction = existingTransactions.data?.find((t) => t);
    if (existingTransaction) {
      // const updated = await client.models.Transaction.update({
      //   ...transaction,
      //   id: existingTransaction.id,
      //   budgetCategoryTransactionsId: undefined,
      // });
      // console.log({ updated, errors: updated.errors });
    } else {
      const created = await client.models.Transaction.create({
        ...transaction,
      });
      console.log({ created, errors: created.errors });
    }
  }
};
