import { readJson, removeKey, writeJson } from "./browserStorage";

/**
 * An in-flight Plaid Link session. Persisted because OAuth banks navigate the
 * whole page away to the bank and back; resuming Link on return requires the
 * same link token and knowing whether this was a new link or a re-auth.
 */
export type PlaidLinkSession =
  | { token: string; mode: "new" }
  | { token: string; mode: "reauth"; connectionId: string };

const STORAGE_KEY = "plaid.linkSession";
const OAUTH_PARAM = "oauth_state_id";

export const saveSession = (session: PlaidLinkSession) =>
  writeJson(STORAGE_KEY, session);

export const loadSession = (): PlaidLinkSession | null =>
  readJson<PlaidLinkSession | null>(STORAGE_KEY, null);

export const clearSession = () => removeKey(STORAGE_KEY);

export const isOAuthReturn = (href: string): boolean => {
  try {
    return new URL(href).searchParams.has(OAUTH_PARAM);
  } catch {
    return false;
  }
};

/** The URL with Plaid's OAuth parameter removed, for history.replaceState. */
export const withoutOAuthParams = (href: string): string => {
  const url = new URL(href);
  url.searchParams.delete(OAUTH_PARAM);
  return url.toString();
};
