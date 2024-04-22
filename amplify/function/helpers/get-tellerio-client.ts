import https from "https";
import axios, { AxiosRequestConfig } from "axios";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "$amplify/env/list-transactions";
import { endOfMonth, subMonths } from "date-fns";

const getS3Contents = async (key: string) => {
  const s3Client = new S3Client();
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: env.jpcFinanceResources_BUCKET_NAME,
    }),
  );
  return await s3Response.Body?.transformToString();
};
export const listTransactions = async (accessKey: string) => {
  const httpsAgent = new https.Agent({
    cert: await getS3Contents("internal/certificate.pem"),
    key: await getS3Contents("internal/private_key.pem"),
  });
  console.log({
    cert: await getS3Contents("internal/certificate.pem"),
    key: await getS3Contents("internal/private_key.pem"),
    auth: { username: accessKey },
  });
  const config = { auth: { username: accessKey }, httpsAgent: httpsAgent };

  const axiosAccountsResponse = await axios.get(
    "https://api.teller.io/accounts",
    config as AxiosRequestConfig,
  );

  console.log({ axiosAccountsResponse });

  const accountIds = axiosAccountsResponse.data.map(
    (account: { id: string }) => account.id,
  );
  console.log({ accountIds });

  const axiosTransactionsResponses = accountIds.map(
    async (accountId: string) => {
      const axiosResponse = await axios.get(
        `https://api.teller.io/accounts/${accountId}/transactions`,
        config as AxiosRequestConfig,
      );
      console.log({ axiosResponse });
      console.log({ data: axiosResponse.data });
      console.log({ statusText: axiosResponse.statusText });

      return axiosResponse.data;
    },
  );

  console.log({ axiosTransactionsResponses });

  const transactions = await Promise.all(axiosTransactionsResponses);
  console.log({ transactions });

  const filteredTransactions = transactions.flat().filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const endOfLastMonth = endOfMonth(subMonths(new Date(), 1));
    return transactionDate.getTime() > endOfLastMonth.getTime();
  });

  return {
    transactions: filteredTransactions,
    accounts: axiosAccountsResponse.data,
  };
};
