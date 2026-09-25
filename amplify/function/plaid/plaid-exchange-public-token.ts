import { LambdaFunctionURLEvent } from "aws-lambda";
import { CountryCode } from "plaid";
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

  // Best-effort institution lookup so the apps can label the connection;
  // a lookup failure must never fail the link itself.
  let institutionName: string | undefined;
  try {
    const item = await plaidClient.itemGet({
      access_token: exchangeResponse.data.access_token,
    });
    const institutionId = item.data.item.institution_id;
    if (institutionId) {
      const institution = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = institution.data.institution.name;
    }
  } catch (e) {
    console.log({ institutionLookupFailed: e });
  }

  const createdPlaidAuthorization =
    await amplifyClient.models.PlaidAuthorization.create({
      accessToken: exchangeResponse.data.access_token,
      userId: body["userId"],
      owner: body["userId"],
      institutionName,
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
