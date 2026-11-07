import { useContext } from "react";
import { PlaidLinkContext } from "../contexts/PlaidLinkContext";

export function usePlaidLinkFlow() {
  const context = useContext(PlaidLinkContext);
  if (!context)
    throw new Error("usePlaidLinkFlow must be used within PlaidLinkProvider");
  return context;
}
