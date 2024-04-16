import { LambdaFunctionURLEvent } from "aws-lambda";
import { client as plaidClient } from "../helpers/get-plaid-client";
import { client as amplifyClient } from "../helpers/get-amplify-client";

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });

  const plaidAuths = await amplifyClient.models.PlaidAuthorization.list();
  console.log({ plaidAuths, errors: plaidAuths.errors });
  const firstPlaidAuth = plaidAuths.data.find((plaidAuth) => plaidAuth);

  const transactionsResponse = await plaidClient.transactionsGet({
    access_token: firstPlaidAuth!.accessToken,
    start_date: "2023-04-14",
    end_date: "2024-04-15",
  });
  const balanceResponse = await plaidClient.accountsBalanceGet({
    access_token: firstPlaidAuth!.accessToken,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      transactions: transactionsResponse.data,
      balance: balanceResponse.data,
      message: "success!",
    }),
  };
};
