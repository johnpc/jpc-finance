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
