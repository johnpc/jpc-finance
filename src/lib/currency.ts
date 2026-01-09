/**
 * Currency conversion utilities
 *
 * Amounts are stored as integers (cents) in the database to avoid
 * floating point precision issues with currency calculations.
 */

export const CENTS_TO_DOLLARS = 100;

export const toDollars = (cents: number): number => cents / CENTS_TO_DOLLARS;

export const toCents = (dollars: number): number =>
  Math.round(dollars * CENTS_TO_DOLLARS);

export const formatCurrency = (cents: number): string => {
  const dollars = toDollars(cents);
  return `$${Math.abs(dollars).toFixed(2)}`;
};

export const formatCurrencyWithSign = (cents: number): string => {
  const dollars = toDollars(cents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
};

// Normalize transaction amounts (Plaid/TellerIO return positive for debits)
export const normalizeTransactionAmount = (
  amount: number,
  isInCents = false,
): number => {
  const cents = isInCents ? amount : toCents(amount);
  return cents * -1; // Flip sign for display
};
