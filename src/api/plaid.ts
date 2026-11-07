import config from "../../amplify_outputs.json";
import { parsePlaidSyncResponse, PlaidSyncResult } from "../lib/plaidSync";

const urls = config.custom;

const postJson = async (url: string, body: unknown): Promise<Response> =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const ensureOk = async (response: Response, what: string) => {
  if (response.ok) return;
  const detail = await response.text().catch(() => "");
  throw new Error(
    `${what} failed (${response.status})${detail ? `: ${detail}` : ""}`,
  );
};

/**
 * Create a Plaid Link token. Passing an existing item's access token opens
 * Link in update mode, which re-authenticates that bank instead of adding one.
 */
export const createLinkToken = async (
  accessToken?: string,
): Promise<string> => {
  const response = accessToken
    ? await postJson(urls.plaidCreateLinkTokenFunction, {
        access_token: accessToken,
      })
    : await fetch(urls.plaidCreateLinkTokenFunction);
  await ensureOk(response, "Starting Plaid Link");
  const json = (await response.json()) as {
    tokenResponse?: { link_token?: string };
  };
  const token = json.tokenResponse?.link_token;
  if (!token) throw new Error("Plaid did not return a link token");
  return token;
};

export const exchangePublicToken = async (
  publicToken: string,
  userId: string,
) => {
  const response = await postJson(urls.plaidExchangePublicTokenFunction, {
    publicToken,
    userId,
  });
  await ensureOk(response, "Saving the bank connection");
};

/** Runs a Plaid sync server-side; the Lambda also records the SyncRun row. */
export const syncPlaid = async (input: {
  accessTokens: string[];
  owner: string;
  date: string;
}): Promise<PlaidSyncResult> => {
  const response = await postJson(urls.plaidListTransactionsFunction, input);
  await ensureOk(response, "Plaid sync");
  return parsePlaidSyncResponse(await response.json());
};

/** Revokes the Plaid item (stops billing) and deletes its authorization row. */
export const removePlaidItem = async (
  userId: string,
  authorizationId: string,
) => {
  const response = await postJson(urls.plaidRemoveItemFunction, {
    userId,
    authorizationId,
  });
  await ensureOk(response, "Unlinking the bank");
};
