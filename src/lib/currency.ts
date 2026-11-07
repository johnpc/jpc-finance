// Amounts are stored as integer cents to avoid floating point drift.
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const toDollars = (cents: number): number => cents / 100;

export const toCents = (dollars: number): number => Math.round(dollars * 100);

/** "$12.34" — always unsigned; callers convey direction with color/labels. */
export const formatMoney = (cents: number): string =>
  formatter.format(Math.abs(toDollars(cents)));

/** "-$12.34" / "$12.34" — keeps the sign. */
export const formatSignedMoney = (cents: number): string =>
  formatter.format(toDollars(cents));

/** Parse a user-typed dollar amount; null when it isn't a usable number. */
export const parseDollarInput = (value: string): number | null => {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0 || dollars >= 1_000_000) {
    return null;
  }
  return toCents(dollars);
};
