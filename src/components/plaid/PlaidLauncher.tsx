import { useEffect } from "react";
import { PlaidLinkError, usePlaidLink } from "react-plaid-link";
import { useError } from "../../hooks/useErrorHook";

type Props = {
  token: string;
  receivedRedirectUri?: string;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
};

/** Opens Plaid Link as soon as it's ready; renders nothing itself. */
export function PlaidLauncher({
  token,
  receivedRedirectUri,
  onSuccess,
  onExit,
}: Props) {
  const { showError } = useError();
  const { open, ready, error } = usePlaidLink({
    token,
    receivedRedirectUri,
    onSuccess: (publicToken) => onSuccess(publicToken),
    onExit: (error: PlaidLinkError | null) => {
      if (error) showError(error.display_message || error.error_message);
      onExit();
    },
  });

  useEffect(() => {
    if (ready) open();
  }, [ready, open]);

  useEffect(() => {
    if (!error) return;
    showError("Couldn't load Plaid. Check your connection and try again.");
    onExit();
  }, [error, showError, onExit]);

  return null;
}
