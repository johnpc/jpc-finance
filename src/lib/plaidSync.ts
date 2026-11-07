import { PlaidConnection } from "./types";

export const REAUTH_ERROR_CODE = "ITEM_LOGIN_REQUIRED";

type LambdaError = {
  accessToken?: string;
  error_code?: string;
  error_message?: string;
};

export type PlaidSyncResult = {
  newTransactionCount: number;
  errors: { code: string; message: string; tokenPrefix?: string }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Parse the list-transactions Lambda body; tolerant of older response shapes. */
export const parsePlaidSyncResponse = (body: unknown): PlaidSyncResult => {
  if (!isRecord(body)) return { newTransactionCount: 0, errors: [] };
  const rawErrors = Array.isArray(body.errors)
    ? (body.errors as LambdaError[])
    : [];
  const errors = rawErrors.map((e) => ({
    code: e.error_code ?? "UNKNOWN",
    message: e.error_message ?? "Unknown error",
    tokenPrefix: e.accessToken,
  }));
  const count =
    typeof body.newTransactionCount === "number" ? body.newTransactionCount : 0;
  return { newTransactionCount: count, errors };
};

/** The Lambda echoes each failing token as its first 20 chars + "...". */
export const tokenPrefix = (accessToken: string): string =>
  `${accessToken.slice(0, 20)}...`;

/** Ids of the connections whose bank login expired in this sync. */
export const connectionsNeedingReauth = (
  result: PlaidSyncResult,
  connections: PlaidConnection[],
): string[] => {
  const prefixes = new Set(
    result.errors
      .filter((e) => e.code === REAUTH_ERROR_CODE && e.tokenPrefix)
      .map((e) => e.tokenPrefix),
  );
  return connections
    .filter((c) => prefixes.has(tokenPrefix(c.accessToken)))
    .map((c) => c.id);
};

export const syncSummary = (result: PlaidSyncResult): string => {
  const count = result.newTransactionCount;
  if (count === 0) return "Everything was already up to date";
  return `${count} new transaction${count === 1 ? "" : "s"} synced`;
};

export const syncErrorSummary = (result: PlaidSyncResult): string | null => {
  const others = result.errors.filter((e) => e.code !== REAUTH_ERROR_CODE);
  if (result.errors.length > others.length && others.length === 0) {
    return "A bank needs you to log in again — see Linked Banks in Settings";
  }
  if (others.length === 0) return null;
  return "Sync had a problem — see Sync History in Settings";
};

export const bankDisplayName = (c: Pick<PlaidConnection, "institutionName">) =>
  c.institutionName ? c.institutionName : "Bank Connection";
