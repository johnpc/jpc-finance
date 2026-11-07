import { createContext } from "react";
import { PlaidConnection } from "../lib/types";

export interface PlaidLinkContextType {
  /** Open Plaid Link to connect a new bank. */
  startLink: () => void;
  /** Open Plaid Link in update mode to log back in to an existing bank. */
  startReauth: (connection: PlaidConnection) => void;
  /** True from the click until Link closes and the connection is saved. */
  isBusy: boolean;
}

export const PlaidLinkContext = createContext<PlaidLinkContextType | undefined>(
  undefined,
);
