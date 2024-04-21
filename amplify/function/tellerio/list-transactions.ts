import { LambdaFunctionURLEvent } from "aws-lambda";
import { listTransactions } from "../helpers/get-tellerio-client";
import { client } from "../helpers/get-amplify-client";

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

const dateToString = (date: Date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
};

const syncAccounts = async (accounts: TellerIoAccount[], owner: string) => {
  const amplifyAccounts = [];
  for (const account of accounts) {
    const existingAccounts =
      await client.models.Account.listByTellerioAccountId({
        tellerioAccountId: account.id,
      });

    const existingAccount = existingAccounts.data?.find((t) => t);
    if (!existingAccount) {
      const created = await client.models.Account.create({
        name: account.name,
        institutionName: account.institution.name,
        type: account.type,
        subType: account.subtype,
        lastFour: Number(account.last_four),
        tellerioAccountId: account.id,
        owner,
      });
      console.log({ created, errors: created.errors });
      amplifyAccounts.push(created.data);
    }
  }

  return amplifyAccounts;
};

const syncTransactions = async (
  tellioTransactions: TellerIoTransaction[],
  owner: string,
) => {
  const transactions = tellioTransactions
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
      owner,
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
  return transactions;
};

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const bodyJson = JSON.parse(event.body ?? "{}");
  const accessToken = bodyJson.accessToken;
  const owner = bodyJson.owner;

  const { accounts, transactions } = await listTransactions(accessToken);
  const amplifyAccounts = await syncAccounts(accounts, owner);
  const amplifyTransactions = await syncTransactions(transactions, owner);
  return {
    statusCode: 200,
    body: JSON.stringify({
      accounts: amplifyAccounts,
      transactions: amplifyTransactions,
      message: "success!",
    }),
  };
};
