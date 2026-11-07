import { describe, expect, it } from "vitest";
import {
  budgetSummary,
  buildMonthView,
  categoryActual,
  sectionCategories,
  sectionTotals,
} from "./budgetMath";
import { categoryStatus, remainingText } from "./categoryStatus";
import {
  BudgetEntity,
  CategoryType,
  CategoryWithTransactions,
  TransactionEntity,
} from "./types";

const tx = (
  id: string,
  amount: number,
  categoryId?: string | null,
): TransactionEntity => ({
  id,
  amount,
  transactionMonth: "11/26",
  date: new Date(2026, 10, 1),
  name: id,
  pending: false,
  budgetCategoryId: categoryId,
});

const cat = (
  id: string,
  type: CategoryType,
  plannedAmount: number,
  amounts: number[] = [],
  name = id,
): CategoryWithTransactions => ({
  id,
  name,
  type,
  plannedAmount,
  transactions: amounts.map((a, i) => tx(`${id}-${i}`, a, id)),
});

describe("buildMonthView", () => {
  const budget: BudgetEntity = {
    id: "b",
    budgetMonth: "11/26",
    categories: [
      { id: "food", name: "Food", type: "Needs", plannedAmount: 100 },
    ],
  };

  it("attaches transactions to their category and leaves the rest uncategorized", () => {
    const view = buildMonthView(budget, [
      tx("a", 10, "food"),
      tx("b", 5, null),
    ]);
    expect(view.categories[0].transactions.map((t) => t.id)).toEqual(["a"]);
    expect(view.uncategorized.map((t) => t.id)).toEqual(["b"]);
  });

  it("treats a transaction pointing at an unknown category as uncategorized", () => {
    const view = buildMonthView(budget, [tx("orphan", 10, "deleted-category")]);
    expect(view.uncategorized.map((t) => t.id)).toEqual(["orphan"]);
    expect(view.categories[0].transactions).toEqual([]);
  });
});

describe("sectionCategories", () => {
  it("filters by type and sorts case-insensitively", () => {
    const list = [
      cat("1", "Wants", 0, [], "zebra"),
      cat("2", "Wants", 0, [], "Apple"),
      cat("3", "Needs", 0),
    ];
    expect(sectionCategories(list, "Wants").map((c) => c.name)).toEqual([
      "Apple",
      "zebra",
    ]);
  });
});

describe("totals", () => {
  it("reports received (positive) for income and spent for expenses", () => {
    expect(categoryActual(cat("pay", "Income", 0, [-5000]))).toBe(5000);
    expect(categoryActual(cat("food", "Needs", 0, [300, -100]))).toBe(200);
    expect(
      sectionTotals([
        cat("a", "Needs", 100, [40]),
        cat("b", "Needs", 50, [10]),
      ]),
    ).toEqual({
      planned: 150,
      actual: 50,
    });
  });

  it("summarizes balance and clamps progress", () => {
    const s = budgetSummary([
      cat("pay", "Income", 1000),
      cat("rent", "Needs", 1000, [1500]),
    ]);
    expect(s.isBalanced).toBe(true);
    expect(s.isOverspent).toBe(true);
    expect(s.progressPercent).toBe(100);
  });

  it("does not divide by zero with no planned income", () => {
    expect(budgetSummary([cat("rent", "Needs", 0)]).progressPercent).toBe(0);
    expect(budgetSummary([cat("rent", "Needs", 0, [10])]).progressPercent).toBe(
      100,
    );
    const unbalanced = budgetSummary([
      cat("pay", "Income", 1000),
      cat("rent", "Needs", 400, [100]),
    ]);
    expect(unbalanced.difference).toBe(600);
    expect(unbalanced.progressPercent).toBe(10);
  });
});

describe("categoryStatus", () => {
  it.each([
    ["no spending", cat("c", "Needs", 100), "normal", "spent"],
    ["no target", cat("c", "Needs", 0, [50]), "normal", "spent"],
    ["under 90%", cat("c", "Needs", 100, [50]), "normal", "spent"],
    ["at 90%", cat("c", "Needs", 100, [90]), "near", "spent"],
    ["over", cat("c", "Needs", 100, [101]), "over", "spent"],
    ["net refund", cat("c", "Needs", 100, [-20]), "surplus", "surplus"],
    ["income", cat("c", "Income", 100, [-500]), "normal", "received"],
  ])("%s", (_, category, level, label) => {
    const status = categoryStatus(category);
    expect(status.level).toBe(level);
    expect(status.label).toBe(label);
    expect(status.amount).toBeGreaterThanOrEqual(0);
  });

  it("describes what's left against the target", () => {
    expect(remainingText(cat("c", "Needs", 10000, [2500]))).toBe("$75.00 left");
    expect(remainingText(cat("c", "Needs", 10000, [12500]))).toBe(
      "$25.00 over",
    );
    expect(remainingText(cat("c", "Income", 10000, [-2500]))).toBe(
      "$75.00 still expected",
    );
    expect(remainingText(cat("c", "Income", 10000, [-10000]))).toBe(
      "Target reached",
    );
  });
});
