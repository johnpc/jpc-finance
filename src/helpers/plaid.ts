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
  await syncPlaidTransactions();
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

export const syncPlaidTransactions = async () => {
  const user = await getCurrentUser();
  const accessTokenResponse = await client.models.PlaidAuthorization.list();
  console.log({ accessTokenResponse });
  if (!accessTokenResponse.data?.length) {
    return;
  }

  const accessToken = accessTokenResponse.data[0].accessToken;
  const response = await fetch(config.custom.plaidGetBalanceFunction, {
    method: "POST",
    body: JSON.stringify({
      accessToken,
      owner: user.userId,
    }),
  });
  const json = await response.json();
  console.log({ json });
};
