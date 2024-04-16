import { CountryCode, Products } from "plaid";
import { client } from "../helpers/get-plaid-client";
import { LambdaFunctionURLEvent } from "aws-lambda";

/**
 * GET /create-link-token
 */
export const handler = async (event: LambdaFunctionURLEvent) => {
  const payload = {
    user: { client_user_id: event.requestContext.requestId },
    client_name: "finance.jpc.io",
    language: "en",
    products: [Products.Auth],
    country_codes: [CountryCode.Us],
    redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
  };
  console.log(event, payload);
  const tokenResponse = await client.linkTokenCreate(payload);

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      tokenResponse: tokenResponse.data,
      message: "success!",
    }),
  };
  return response;
};
