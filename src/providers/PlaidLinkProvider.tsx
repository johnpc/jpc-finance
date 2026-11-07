import { ReactNode } from "react";
import { PlaidLinkContext } from "../contexts/PlaidLinkContext";
import { usePlaidLinkSession } from "../hooks/usePlaidLinkSession";
import { PlaidLauncher } from "../components/plaid/PlaidLauncher";

/**
 * Owns the one Plaid Link session the app can have open, so linking a bank,
 * re-authenticating one, and resuming after an OAuth bank's redirect all share
 * the same success path (save → sync).
 */
export function PlaidLinkProvider({ children }: { children: ReactNode }) {
  const {
    session,
    redirectUri,
    onSuccess,
    onExit,
    startLink,
    startReauth,
    isBusy,
  } = usePlaidLinkSession();

  return (
    <PlaidLinkContext.Provider value={{ startLink, startReauth, isBusy }}>
      {children}
      {session && (
        <PlaidLauncher
          key={session.token}
          token={session.token}
          receivedRedirectUri={redirectUri}
          onSuccess={onSuccess}
          onExit={onExit}
        />
      )}
    </PlaidLinkContext.Provider>
  );
}
