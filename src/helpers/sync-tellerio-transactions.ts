import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import config from "../../amplifyconfiguration.json";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();
export const syncTellerioTransactions = async () => {
  const accessTokenResponse = await client.models.TellerAuthorization.list();
  const accessToken = accessTokenResponse.data[0].accessToken;
  const owner = await getCurrentUser();
  const fetchResult = await fetch(
    config.custom.tellerioListTransactionsFunction,
    {
      method: "POST",
      body: JSON.stringify({
        accessToken,
        owner: owner.userId,
      }),
    },
  );
  const json = await fetchResult.json();
  console.log({ json });
};
