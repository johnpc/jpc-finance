import { CountryCode, LinkTokenCreateResponse, Products } from "plaid";
import { client } from "../helpers/get-plaid-client";
import { LambdaFunctionURLEvent } from "aws-lambda";
import { AxiosError, AxiosResponse } from "axios";

/**
 * Creates a Plaid Link token.
 * - GET or POST without body: new link (products: Transactions)
 * - POST with { "access_token": "..." }: update mode for re-authentication
 */
export const handler = async (event: LambdaFunctionURLEvent) => {
  const body = event.body ? JSON.parse(event.body) : {};
  const accessToken = body.access_token;

  const payload: any = {
    user: { client_user_id: event.requestContext.requestId },
    client_name: "finance.jpc.io",
    language: "en",
    country_codes: [CountryCode.Us],
    redirect_uri: process.env.PLAID_REDIRECT_URI,
  };

  if (accessToken) {
    payload.access_token = accessToken;
  } else {
    payload.products = [Products.Transactions];
  }

  console.log(event, payload);
  let tokenResponse;
  try {
    tokenResponse = await client.linkTokenCreate(payload);
  } catch (e) {
    console.log({ e });
    console.log({ response: (e as AxiosError).response });
    console.log({ data: (e as AxiosError).response?.data });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: (e as AxiosError).response?.data || "Failed to create link token",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      tokenResponse: (
        tokenResponse as AxiosResponse<LinkTokenCreateResponse, { data: string }>
      ).data,
      message: "success!",
    }),
  };
};
