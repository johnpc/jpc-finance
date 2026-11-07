import { usePlaidConnections } from "./usePlaidConnections";
import { usePlaidLinkFlow } from "./usePlaidLinkFlow";
import { usePlaidReauth } from "./usePlaidReauth";
import { useUnlinkBank } from "./useUnlinkBank";
import { bankDisplayName } from "../lib/plaidSync";
import { PlaidConnection } from "../lib/types";

/** Linked banks with their re-auth state and link/re-auth/unlink actions. */
export function useLinkedBanks() {
  const { data: connections = [], isLoading } = usePlaidConnections();
  const { ids: reauthIds } = usePlaidReauth();
  const { startLink, startReauth, isBusy } = usePlaidLinkFlow();
  const unlink = useUnlinkBank();

  const needingReauth = connections.filter((c) => reauthIds.includes(c.id));

  const confirmUnlink = (connection: PlaidConnection) => {
    const name = bankDisplayName(connection);
    const ok = window.confirm(
      `Unlink ${name}? Future syncs will no longer include this bank. Existing transactions are kept.`,
    );
    if (ok) unlink.mutate(connection);
  };

  return {
    connections,
    isLoading,
    needingReauth,
    needsReauth: (c: PlaidConnection) => reauthIds.includes(c.id),
    startLink,
    startReauth,
    confirmUnlink,
    isBusy: isBusy || unlink.isPending,
  };
}
