import { useContext } from "react";
import { DateContext } from "../contexts/DateContext";

export function useDate() {
  const context = useContext(DateContext);
  if (!context) throw new Error("useDate must be used within DateProvider");
  return context;
}
