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

type TellerIoAccount = {
  type: "credit" | "depository";
  subtype: "credit_card" | "checking" | "saving";
  name: string;
  institution: {
    name: string;
    id: string;
  };
  last_four: string;
  id: string;
};
export const syncTellerioAccounts = async (accounts: TellerIoAccount[]) => {
  for (const account of accounts) {
    const existingAccounts =
      await client.models.Account.listByTellerioAccountId({
        tellerioAccountId: account.id,
      });

    const existingAccount = existingAccounts.data?.find((t) => t);
    if (existingAccount) {
      // const updated = await client.models.Transaction.update({
      //   ...transaction,
      //   id: existingTransaction.id,
      //   budgetCategoryTransactionsId: undefined,
      // });
      // console.log({ updated, errors: updated.errors });
    } else {
      const created = await client.models.Account.create({
        name: account.name,
        institutionName: account.institution.name,
        type: account.type,
        subType: account.subtype,
        lastFour: Number(account.last_four),
        tellerioAccountId: account.id,
      });
      console.log({ created, errors: created.errors });
    }
  }
};

export const syncTellerioTransactions = async () => {
  const accessTokenResponse = await client.models.TellerAuthorization.list();
  const accessToken = accessTokenResponse.data[0].accessToken;
  const fetchResult = await fetch(
    config.custom.tellerioListTransactionsFunction,
    {
      method: "POST",
      body: JSON.stringify({
        accessToken,
      }),
    },
  );
  const json = await fetchResult.json();
  await syncTellerioAccounts(json.accounts);
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
        tellerioTransactionId: transaction.tellerioTransactionId,
      });
    const existingTransaction = existingTransactions.data?.find((t) => t);
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
};
