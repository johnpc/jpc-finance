import { LambdaFunctionURLEvent } from "aws-lambda";
import { client as plaidClient } from "../helpers/get-plaid-client";
import { client as amplifyClient } from "../helpers/get-amplify-client";
/**
 * POST /exchange-public-token
 */
export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const body = JSON.parse(event.body!);

  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: body["publicToken"],
  });

  const createdPlaidAuthorization =
    await amplifyClient.models.PlaidAuthorization.create({
      accessToken: exchangeResponse.data.access_token,
      userId: body["userId"],
    });
  console.log({
    createdPlaidAuthorization,
    errors: createdPlaidAuthorization.errors,
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      createdPlaidAuthorization,
      accessToken: exchangeResponse.data.access_token,
      message: "success!",
    }),
  };

  return response;
};
