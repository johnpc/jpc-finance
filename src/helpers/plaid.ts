import { getCurrentUser } from "aws-amplify/auth";
import config from "../../amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
const client = generateClient<Schema>();

export const exchangePublicToken = async (
  publicToken: string,
): Promise<string> => {
  const user = await getCurrentUser();
  const fetchResponse = await fetch(
    config.custom.plaidExchangePublicTokenFunction,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicToken, userId: user.userId }),
    },
  );
  const { accessToken } = await fetchResponse.json();
  await syncPlaidTransactions(new Date());
  return accessToken;
};

export const createLinkToken = async (): Promise<string> => {
  let linkToken: string;
  // For OAuth, use previously generated Link token
  if (window.location.href.includes("?oauth_state_id=")) {
    linkToken = localStorage.getItem("link_token")!;
  } else {
    const response = await fetch(
      config.custom.plaidCreateLinkTokenFunction,
      {},
    );
    const data = await response.json();
    linkToken = data.tokenResponse.link_token;
    localStorage.setItem("link_token", data.link_token);
  }

  return linkToken;
};

export const syncPlaidTransactions = async (date: Date) => {
  const user = await getCurrentUser();
  const accessTokenResponse = await client.models.PlaidAuthorization.list();
  console.log({ accessTokenResponse });
  if (!accessTokenResponse.data?.length) {
    return;
  }

  const accessTokens = accessTokenResponse.data?.map(
    (plaidAuthorization: Schema["PlaidAuthorization"]) =>
      plaidAuthorization.accessToken,
  );
  const response = await fetch(config.custom.plaidListTransactionsFunction, {
    method: "POST",
    body: JSON.stringify({
      accessTokens,
      owner: user.userId,
      date: date.toLocaleString(),
    }),
  });
  const json = await response.json();
  console.log({ json });
};
