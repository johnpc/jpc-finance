import { client } from "../lib/amplify-client";
import config from "../../amplify_outputs.json";
import { getCurrentUser } from "aws-amplify/auth";
export const syncTellerioTransactions = async (date: Date) => {
  const accessTokenResponse = await client.models.TellerAuthorization.list();
  if (!accessTokenResponse.data?.length) {
    return;
  }
  const accessTokens = accessTokenResponse.data?.map(
    (tellerAuthorization) => tellerAuthorization.accessToken,
  );
  const owner = await getCurrentUser();
  const fetchResult = await fetch(
    config.custom.tellerioListTransactionsFunction,
    {
      method: "POST",
      body: JSON.stringify({
        accessTokens,
        owner: owner.userId,
        date: date.toLocaleString(),
      }),
    },
  );
  const json = await fetchResult.json();
  console.log({ json });
};
