import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuthHook";
import { useError } from "./useErrorHook";
import { usePlaidReauth } from "./usePlaidReauth";
import { useSyncTransactions } from "./useSyncTransactions";
import { createLinkToken, exchangePublicToken } from "../api/plaid";
import { queryKeys } from "../lib/queryKeys";
import { PlaidConnection } from "../lib/types";
import {
  clearSession,
  isOAuthReturn,
  loadSession,
  PlaidLinkSession,
  saveSession,
  withoutOAuthParams,
} from "../lib/plaidSession";

const initialResume = () => {
  const href = window.location.href;
  if (!isOAuthReturn(href)) return { session: null, redirectUri: undefined };
  const session = loadSession();
  if (!session) {
    window.history.replaceState(null, "", withoutOAuthParams(href));
    return { session: null, redirectUri: undefined };
  }
  return { session, redirectUri: href };
};

/** State machine behind PlaidLinkProvider: start → Link open → save → sync. */
export function usePlaidLinkSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showError, showSuccess } = useError();
  const { markFixed } = usePlaidReauth();
  const sync = useSyncTransactions();
  const [resume] = useState(initialResume);
  const [session, setSession] = useState<PlaidLinkSession | null>(
    resume.session,
  );
  const [redirectUri, setRedirectUri] = useState(resume.redirectUri);

  const end = useCallback(() => {
    clearSession();
    setSession(null);
    if (redirectUri) {
      window.history.replaceState(null, "", withoutOAuthParams(redirectUri));
      setRedirectUri(undefined);
    }
  }, [redirectUri]);

  const start = useMutation({
    retry: false,
    mutationFn: async (
      connection?: PlaidConnection,
    ): Promise<PlaidLinkSession> => {
      const token = await createLinkToken(connection?.accessToken);
      return connection
        ? { token, mode: "reauth", connectionId: connection.id }
        : { token, mode: "new" };
    },
    onSuccess: (next) => {
      saveSession(next);
      setSession(next);
    },
    onError: (error) => showError(`Couldn't open Plaid: ${error.message}`),
  });

  const finish = useMutation({
    retry: false,
    mutationFn: async ({
      publicToken,
      linked,
    }: {
      publicToken: string;
      linked: PlaidLinkSession;
    }) => {
      if (linked.mode === "reauth") return markFixed(linked.connectionId);
      if (!user) throw new Error("Not signed in");
      await exchangePublicToken(publicToken, user.userId);
    },
    onSuccess: (_, { linked }) => {
      showSuccess(
        linked.mode === "new"
          ? "Bank linked — syncing now"
          : "Bank reconnected — syncing now",
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.plaidConnections() });
      sync.mutate();
    },
    onError: (error) =>
      showError(`Couldn't save the bank connection: ${error.message}`),
  });

  const onSuccess = useCallback(
    (publicToken: string) => {
      if (session) finish.mutate({ publicToken, linked: session });
      end();
    },
    [session, finish, end],
  );

  return {
    session,
    redirectUri,
    onSuccess,
    onExit: end,
    startLink: () => start.mutate(undefined),
    startReauth: (connection: PlaidConnection) => start.mutate(connection),
    isBusy: start.isPending || finish.isPending || session !== null,
  };
}
