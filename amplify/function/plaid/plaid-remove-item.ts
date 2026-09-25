import { LambdaFunctionURLEvent } from "aws-lambda";
import { client as plaidClient } from "../helpers/get-plaid-client";
import { client as amplifyClient } from "../helpers/get-amplify-client";

/**
 * POST /remove-item { userId, authorizationId }
 *
 * Unlinks a bank connection: revokes the Plaid item (stops Plaid billing for
 * it) and deletes the PlaidAuthorization record so syncs stop using it.
 * Existing transactions are left untouched — unlinking must never delete
 * spending history.
 */
export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const body = JSON.parse(event.body ?? "{}");
  const { userId, authorizationId } = body;
  if (!userId || !authorizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "userId and authorizationId are required",
      }),
    };
  }

  const record = await amplifyClient.models.PlaidAuthorization.get({
    id: authorizationId,
  });
  // The userId check ensures a caller can only remove a connection they can
  // already read; a mismatch and a missing record are indistinguishable on
  // purpose.
  if (!record.data || record.data.userId !== userId) {
    return { statusCode: 404, body: JSON.stringify({ message: "not found" }) };
  }

  // Best-effort revoke: an item that's already dead at Plaid (expired,
  // institution-revoked) must not block removing the record.
  try {
    await plaidClient.itemRemove({ access_token: record.data.accessToken });
  } catch (e: unknown) {
    const plaidError = (e as { response?: { data?: unknown } })?.response?.data;
    console.log({ itemRemoveFailed: plaidError ?? e });
  }

  const deleted = await amplifyClient.models.PlaidAuthorization.delete({
    id: authorizationId,
  });
  console.log({ deleted, errors: deleted.errors });
  if (deleted.errors?.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "failed to delete authorization" }),
    };
  }
  return { statusCode: 200, body: JSON.stringify({ message: "success!" }) };
};
