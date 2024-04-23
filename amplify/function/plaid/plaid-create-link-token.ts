import { CountryCode, LinkTokenCreateResponse, Products } from "plaid";
import { client } from "../helpers/get-plaid-client";
import { LambdaFunctionURLEvent } from "aws-lambda";
import { AxiosError, AxiosResponse } from "axios";

/**
 * GET /create-link-token
 */
export const handler = async (event: LambdaFunctionURLEvent) => {
  const payload = {
    user: { client_user_id: event.requestContext.requestId },
    client_name: "finance.jpc.io",
    language: "en",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    redirect_uri: process.env.PLAID_REDIRECT_URI,
  };
  console.log(event, payload);
  let tokenResponse;
  try {
    tokenResponse = await client.linkTokenCreate(payload);
  } catch (e) {
    console.log({ e });
    console.log({ response: (e as AxiosError).response });
    console.log({ data: (e as AxiosError).response?.data });
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      tokenResponse: (
        tokenResponse as AxiosResponse<
          LinkTokenCreateResponse,
          { data: string }
        >
      ).data,
      message: "success!",
    }),
  };
  return response;
};
