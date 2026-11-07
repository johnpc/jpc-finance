import { describe, expect, it } from "vitest";
import {
  patchTransaction,
  removeTransaction,
  uncategorizeAll,
} from "./transactionCache";
import {
  parseCalendarDay,
  toActiveTransactions,
  toCategoryEntity,
} from "./mappers";
import {
  categoriesForNewBudget,
  mostRecentBudgetBefore,
  STARTER_CATEGORIES,
} from "./newBudget";
import { TransactionEntity } from "./types";

const row = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  amount: -1250,
  transactionMonth: "11/26",
  date: "2026-11-07",
  name: "Store",
  pending: false,
  ...overrides,
});

describe("mappers", () => {
  it("parses a calendar day as a local date (no off-by-one west of UTC)", () => {
    const d = parseCalendarDay("2026-11-07");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 7]);
  });

  it("drops soft-deleted rows, flips the sign, and sorts newest first", () => {
    const result = toActiveTransactions([
      row("old", { date: "2026-11-01", budgetCategoryTransactionsId: "c" }),
      row("gone", { deleted: true }),
      row("new", { date: "2026-11-09", displayName: "Renamed" }),
    ]);
    expect(result.map((t) => t.id)).toEqual(["new", "old"]);
    expect(result[0].amount).toBe(1250);
    expect(result[0].displayName).toBe("Renamed");
    expect(result[1].budgetCategoryId).toBe("c");
  });

  it("falls back to Wants for an unknown category type", () => {
    expect(
      toCategoryEntity({ id: "1", name: "x", type: "Bogus", plannedAmount: 0 })
        .type,
    ).toBe("Wants");
    expect(
      toCategoryEntity({ id: "1", name: "x", type: "Income", plannedAmount: 0 })
        .type,
    ).toBe("Income");
  });
});

describe("transaction cache transforms", () => {
  const list: TransactionEntity[] = toActiveTransactions([
    row("a", { budgetCategoryTransactionsId: "c1" }),
    row("b", { budgetCategoryTransactionsId: "c2" }),
  ]);

  it("patches, removes, and uncategorizes", () => {
    expect(
      patchTransaction(list, "a", { displayName: "X" })?.find(
        (t) => t.id === "a",
      )?.displayName,
    ).toBe("X");
    expect(removeTransaction(list, "a")?.map((t) => t.id)).toEqual(["b"]);
    const cleared = uncategorizeAll(list, "c1");
    expect(cleared?.find((t) => t.id === "a")?.budgetCategoryId).toBeNull();
    expect(cleared?.find((t) => t.id === "b")?.budgetCategoryId).toBe("c2");
  });

  it("leaves an empty cache empty", () => {
    expect(patchTransaction(undefined, "a", {})).toBeUndefined();
    expect(removeTransaction(undefined, "a")).toBeUndefined();
    expect(uncategorizeAll(undefined, "c")).toBeUndefined();
  });
});

describe("new budget", () => {
  const budgets = [
    { id: "dec25", budgetMonth: "12/25" },
    { id: "sep26", budgetMonth: "09/26" },
    { id: "dec26", budgetMonth: "12/26" },
  ];

  it("copies from the latest budget strictly before the month, across years", () => {
    expect(mostRecentBudgetBefore(budgets, "11/26")?.id).toBe("sep26");
    expect(mostRecentBudgetBefore(budgets, "01/26")?.id).toBe("dec25");
    expect(mostRecentBudgetBefore(budgets, "11/25")).toBeUndefined();
  });

  it("copies name, type, and target only — or seeds starters", () => {
    const copied = categoriesForNewBudget([
      { name: "Rent", type: "Needs", plannedAmount: 5, id: "x" } as never,
    ]);
    expect(copied).toEqual([{ name: "Rent", type: "Needs", plannedAmount: 5 }]);
    expect(categoriesForNewBudget(null)).toBe(STARTER_CATEGORIES);
  });
});
