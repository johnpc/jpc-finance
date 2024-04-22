import { LambdaFunctionURLEvent } from "aws-lambda";
import { client as plaidClient } from "../helpers/get-plaid-client";
import { client as amplifyClient } from "../helpers/get-amplify-client";
import { endOfMonth, subMonths } from "date-fns";
import { AccountBase } from "plaid";

const dateToString = (date: Date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
};

type PlaidTransaction = {
  amount: number;
  authorized_date?: string | null;
  date: string;
  merchant_name?: string | null;
  name: string | null;
  website?: string | null;
  pending: boolean;
  transaction_id: string;
};

const syncTransactions = async (
  plaidTransactions: PlaidTransaction[],
  owner: string,
) => {
  const transactions = plaidTransactions.map(
    (plaidTransaction: PlaidTransaction) => ({
      amount: Math.floor(plaidTransaction.amount * 100),
      transactionMonth: new Date(plaidTransaction.date).toLocaleDateString(
        undefined,
        { month: "2-digit", year: "2-digit" },
      ),
      date: dateToString(new Date(plaidTransaction.date)),
      name:
        plaidTransaction.merchant_name ||
        plaidTransaction.name ||
        plaidTransaction.website,
      pending: plaidTransaction.pending,
      plaidTransactionId: plaidTransaction.transaction_id,
      owner,
    }),
  );

  for (const transaction of transactions) {
    const existingTransactions =
      await amplifyClient.models.Transaction.listByPlaidTransactionId({
        plaidTransactionId: transaction.plaidTransactionId,
      });
    const existingTransaction = existingTransactions.data?.find((t) => t);
    if (existingTransaction) {
      const updated = await amplifyClient.models.Transaction.update({
        ...transaction,
        id: existingTransaction.id,
        budgetCategoryTransactionsId: undefined,
        name: transaction.name!,
      });
      console.log({ updated, errors: updated.errors });
    } else {
      const created = await amplifyClient.models.Transaction.create({
        ...transaction,
        name: transaction.name!,
      });
      console.log({ created, errors: created.errors });
    }
  }
};

const syncAccounts = async (plaidAccounts: AccountBase[], owner: string) => {
  const amplifyAccounts = [];
  for (const account of plaidAccounts) {
    const existingAccounts =
      await amplifyClient.models.Account.listByPlaidAccountId({
        plaidAccountId: account.account_id,
      });

    const existingAccount = existingAccounts.data?.find((t) => t);
    if (!existingAccount) {
      const created = await amplifyClient.models.Account.create({
        name: account.name,
        institutionName: account.official_name || account.name,
        type: account.type,
        subType: account.subtype || account.type,
        plaidAccountId: account.account_id,
        owner,
      });
      console.log({ created, errors: created.errors });
      amplifyAccounts.push(created.data);
    }
  }

  return amplifyAccounts;
};

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const bodyJson = JSON.parse(event.body ?? "{}");
  const accessToken = bodyJson.accessToken;
  const owner = bodyJson.owner;

  const date = new Date();
  const lastMonth = endOfMonth(subMonths(date, 1));
  const transactionsResponse = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: dateToString(lastMonth),
    end_date: dateToString(date),
  });
  const balanceResponse = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });
  await syncTransactions(transactionsResponse.data.transactions, owner);
  await syncAccounts(balanceResponse.data.accounts, owner);

  return {
    statusCode: 200,
    body: JSON.stringify({
      transactions: transactionsResponse.data,
      balance: balanceResponse.data,
      message: "success!",
    }),
  };
};
