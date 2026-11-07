import { DataClient } from "../lib/amplify-client";
import { fetchAllPages, throwOnErrors } from "../lib/amplify-types";
import { PlaidConnection } from "../lib/types";

/** The user's linked Plaid banks ("items"), oldest first. */
export const fetchPlaidConnections = async (
  client: DataClient,
  userId: string,
): Promise<PlaidConnection[]> => {
  const rows = await fetchAllPages({ userId }, (params) =>
    client.models.PlaidAuthorization.listPlaidAuthorizationByUserId(params),
  );
  return rows
    .map((r) => ({
      id: r.id,
      accessToken: r.accessToken,
      institutionName: r.institutionName,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
};

/**
 * A sync with no linked banks never reaches the Lambda, which is what normally
 * writes the history row — record it here so "last sync" reflects every run.
 */
export const recordEmptyPlaidSync = async (
  client: DataClient,
  owner: string,
  startedAt: Date,
) => {
  try {
    throwOnErrors(
      await client.models.SyncRun.create({
        source: "plaid",
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        newTransactionCount: 0,
        owner,
      }),
    );
  } catch (error) {
    // A failed history write must never fail the sync itself.
    console.warn("Couldn't record sync history", error);
  }
};
