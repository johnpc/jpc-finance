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
  pending_transaction_id?: string | null;
};

const syncTransactions = async (
  plaidTransactions: PlaidTransaction[],
  owner: string,
) => {
  for (const plaidTransaction of plaidTransactions) {
    const transaction = {
      amount: Math.floor(plaidTransaction.amount * 100) * -1,
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
    };

    // If this is a posted transaction that was previously pending, delete the pending one
    if (!plaidTransaction.pending && plaidTransaction.pending_transaction_id) {
      const pendingTxns =
        await amplifyClient.models.Transaction.listTransactionByPlaidTransactionId(
          { plaidTransactionId: plaidTransaction.pending_transaction_id },
        );
      const pendingTxn = pendingTxns.data?.find((t) => t);
      if (pendingTxn) {
        await amplifyClient.models.Transaction.update({
          id: pendingTxn.id,
          deleted: true,
        });
        console.log({ deletedPending: pendingTxn.id, postedId: plaidTransaction.transaction_id });
      }
    }

    // Check by plaidTransactionId first
    const existingByPlaidId =
      await amplifyClient.models.Transaction.listTransactionByPlaidTransactionId(
        {
          plaidTransactionId: transaction.plaidTransactionId,
        },
      );
    const existingTransaction = existingByPlaidId.data?.find((t) => t);
    if (existingTransaction) {
      const updated = await amplifyClient.models.Transaction.update({
        ...transaction,
        id: existingTransaction.id,
        budgetCategoryTransactionsId: undefined,
        name: transaction.name!,
      });
      console.log({ updated, errors: updated.errors });
    } else {
      // Dedupe fallback: same amount + pending transaction + dates within 3 days
      // For cases where pending_transaction_id wasn't provided
      if (!plaidTransaction.pending) {
        const existingByMonth =
          await amplifyClient.models.Transaction.listTransactionByTransactionMonth(
            { transactionMonth: transaction.transactionMonth },
            {
              filter: {
                owner: { eq: transaction.owner },
                amount: { eq: transaction.amount },
              },
            },
          );

        const pendingDupe = existingByMonth.data?.find((t) => {
          if (!t || t.deleted || !t.pending) return false;
          const daysDiff = Math.abs(
            new Date(transaction.date).getTime() - new Date(t.date).getTime()
          ) / (1000 * 60 * 60 * 24);
          return daysDiff <= 5;
        });

        if (pendingDupe) {
          // Delete the pending, create the posted
          await amplifyClient.models.Transaction.update({
            id: pendingDupe.id,
            deleted: true,
          });
          console.log({ deletedPendingFallback: pendingDupe.id, reason: "posted version arrived" });
        }
      }

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
      await amplifyClient.models.Account.listAccountByPlaidAccountId({
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
  const accessTokens = bodyJson.accessTokens;
  const owner = bodyJson.owner;
  const date = bodyJson.date ? new Date(bodyJson.date) : new Date();
  const lastMonth = endOfMonth(subMonths(date, 1));

  const aggregatedAccounts = [] as AccountBase[][];
  const aggregatedTransactions = [] as PlaidTransaction[][];
  const promises = accessTokens.map(async (accessToken: string) => {
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: dateToString(lastMonth),
      end_date: dateToString(date),
    });
    console.log({ transactionsResponse });
    console.log({ transactionsResponseData: transactionsResponse.data });

    await syncTransactions(transactionsResponse.data.transactions, owner);
    aggregatedTransactions.push(transactionsResponse.data.transactions);
    await syncAccounts(transactionsResponse.data.accounts, owner);
    aggregatedAccounts.push(transactionsResponse.data.accounts);
  });
  await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify({
      transactions: aggregatedAccounts,
      accounts: aggregatedAccounts,
      message: "success!",
    }),
  };
};
