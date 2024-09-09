import { LambdaFunctionURLEvent } from "aws-lambda";
import { listTransactions } from "../helpers/get-tellerio-client";
import { client } from "../helpers/get-amplify-client";
import { Schema } from "../../data/resource";

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
      await client.models.Account.listAccountByTellerioAccountId({
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
      amplifyAccounts.push(created.data!);
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
  const transactionPromises = transactions.map(async (transaction) => {
    const existingTransactions =
      await client.models.Transaction.listTransactionByTellerioTransactionId({
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
  });
  await Promise.all(transactionPromises);
  return transactions;
};

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const bodyJson = JSON.parse(event.body ?? "{}");
  const accessTokens = bodyJson.accessTokens;
  const owner = bodyJson.owner;
  const date = bodyJson.date ? new Date(bodyJson.date) : new Date();

  const aggregatedAccounts = [] as Schema["Account"]["type"][][];
  const aggregatedTransactions = [] as Schema["Transaction"]["type"][][];
  const promises = accessTokens.map(async (accessToken: string) => {
    const { accounts, transactions } = await listTransactions(
      accessToken,
      date,
    );
    const sa = async () => {
      const amplifyAccounts = await syncAccounts(accounts, owner);
      aggregatedAccounts.push(amplifyAccounts);
    }
    const st = async () => {
      const amplifyTransactions = await syncTransactions(transactions, owner);
      aggregatedTransactions.push(
        amplifyTransactions as Schema["Transaction"]["type"][],
      );
    }
    await Promise.all([sa(), st()]);
  });
  await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify({
      accounts: aggregatedAccounts.flat(),
      transactions: aggregatedTransactions.flat(),
      message: "success!",
    }),
  };
};
