import { describe, expect, it } from "vitest";
import { formatMoney, formatSignedMoney, parseDollarInput } from "./currency";
import {
  formatBudgetMonth,
  formatMonthYear,
  formatShortDate,
  formatSyncDate,
  parseBudgetMonth,
  resolveSyncDate,
} from "./dateUtils";
import {
  countText,
  durationText,
  lastSyncText,
  sourceLabel,
  timestampText,
} from "./syncHistory";
import { displayedName, normalizeDisplayName } from "./transactionName";
import { validateCategoryName } from "./categoryName";

describe("currency", () => {
  it("formats unsigned and signed amounts", () => {
    expect(formatMoney(-123456)).toBe("$1,234.56");
    expect(formatSignedMoney(-500)).toBe("-$5.00");
  });

  it.each([
    ["", 0],
    ["250", 25000],
    ["$1,099.99", 109999],
    ["19.99", 1999],
    ["abc", null],
    ["-5", null],
    ["1000000", null],
  ])("parses %j", (input, expected) => {
    expect(parseDollarInput(input)).toBe(expected);
  });
});

describe("dates", () => {
  it("uses the backend's en-US month partition format", () => {
    expect(formatBudgetMonth(new Date(2026, 0, 15))).toBe("01/26");
    expect(parseBudgetMonth("01/26")).toEqual(new Date(2026, 0, 1));
    expect(formatMonthYear(new Date(2026, 10, 1))).toBe("November 2026");
    expect(formatShortDate(new Date(2026, 10, 7))).toBe("Nov 7");
    expect(formatSyncDate(new Date(2026, 10, 7, 8, 5, 9))).toBe(
      "11/7/2026, 8:05:09 AM",
    );
  });

  it("syncs as of now when viewing this month, else the viewed date", () => {
    const now = new Date(2026, 10, 20);
    expect(resolveSyncDate(new Date(2026, 10, 1), now)).toBe(now);
    const october = new Date(2026, 9, 1);
    expect(resolveSyncDate(october, now)).toBe(october);
  });
});

describe("sync history text", () => {
  it("formats rows", () => {
    expect(sourceLabel("plaid")).toBe("Plaid");
    expect(sourceLabel("financeKit")).toBe("Apple Card");
    expect(sourceLabel("teller")).toBe("Teller");
    expect(countText(0)).toBe("No new transactions");
    expect(countText(1)).toBe("1 new transaction");
    expect(countText(2)).toBe("2 new transactions");
    expect(durationText(400)).toBe("<1s");
    expect(durationText(14_900)).toBe("14s");
    expect(durationText(125_000)).toBe("2m 5s");
    expect(timestampText("not a date")).toBe("not a date");
  });

  it("captions the newest run", () => {
    expect(lastSyncText(undefined)).toBeNull();
    const run = {
      id: "1",
      source: "plaid",
      startedAt: "2026-11-07T13:00:00.000Z",
      durationMs: 1,
      newTransactionCount: 0,
    };
    expect(lastSyncText(run)).toMatch(/^Last sync at: 11\/7\/26/);
  });
});

describe("transaction names", () => {
  it("prefers the override", () => {
    expect(displayedName({ name: "SQ *COFFEE", displayName: "Coffee" })).toBe(
      "Coffee",
    );
    expect(displayedName({ name: "SQ *COFFEE", displayName: null })).toBe(
      "SQ *COFFEE",
    );
  });

  it("clears the override when blank or unchanged", () => {
    expect(normalizeDisplayName("  Coffee ", "SQ *COFFEE")).toBe("Coffee");
    expect(normalizeDisplayName("   ", "SQ *COFFEE")).toBeNull();
    expect(normalizeDisplayName("SQ *COFFEE", "SQ *COFFEE")).toBeNull();
  });
});

describe("validateCategoryName", () => {
  it("requires 1-50 characters", () => {
    expect(validateCategoryName(" ")).toMatch(/empty/);
    expect(validateCategoryName("x".repeat(51))).toMatch(/50/);
    expect(validateCategoryName("Groceries")).toBeNull();
  });
});
