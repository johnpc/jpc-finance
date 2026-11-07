import { categorySpent } from "./budgetMath";
import { formatMoney } from "./currency";
import { CategoryWithTransactions } from "./types";

export type StatusLevel = "surplus" | "over" | "near" | "normal";

export type CategoryStatus = {
  level: StatusLevel;
  /** Unsigned cents to display next to the label. */
  amount: number;
  label: "received" | "surplus" | "spent";
};

/**
 * Color-codes a category row: net refund (surplus), ≥90% of target (near),
 * past target (over). Income rows are never flagged.
 */
export const categoryStatus = (c: CategoryWithTransactions): CategoryStatus => {
  const spent = categorySpent(c);
  if (c.type === "Income") {
    return { level: "normal", amount: Math.abs(spent), label: "received" };
  }
  if (spent < 0) return { level: "surplus", amount: -spent, label: "surplus" };
  const base = { amount: spent, label: "spent" as const };
  if (spent === 0 || c.plannedAmount <= 0) return { ...base, level: "normal" };
  if (spent > c.plannedAmount) return { ...base, level: "over" };
  if (spent >= c.plannedAmount * 0.9) return { ...base, level: "near" };
  return { ...base, level: "normal" };
};

/** "$40.00 left" / "$12.50 over" against the category's monthly target. */
export const remainingText = (c: CategoryWithTransactions): string => {
  const actual = c.type === "Income" ? -categorySpent(c) : categorySpent(c);
  const remaining = c.plannedAmount - actual;
  const dollars = formatMoney(remaining);
  if (c.type === "Income")
    return remaining > 0 ? `${dollars} still expected` : "Target reached";
  return remaining >= 0 ? `${dollars} left` : `${dollars} over`;
};
