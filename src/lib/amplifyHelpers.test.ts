import { describe, expect, it } from "vitest";
import { fetchAllPages, throwOnErrors } from "./amplify-types";
import { queryKeys } from "./queryKeys";

describe("fetchAllPages", () => {
  it("follows nextToken until exhausted, passing base params through", async () => {
    const pages: Record<string, { data: number[]; nextToken: string | null }> =
      {
        start: { data: [1, 2], nextToken: "p2" },
        p2: { data: [], nextToken: "p3" },
        p3: { data: [3], nextToken: null },
      };
    const seen: unknown[] = [];
    const all = await fetchAllPages({ month: "11/26" }, async (params) => {
      seen.push(params);
      return pages[params.nextToken ?? "start"];
    });
    expect(all).toEqual([1, 2, 3]);
    expect(seen[0]).toEqual({ month: "11/26", nextToken: null });
  });
});

describe("throwOnErrors", () => {
  it("passes clean results through and throws on GraphQL errors", () => {
    const ok = { data: 1, errors: null };
    expect(throwOnErrors(ok)).toBe(ok);
    expect(() =>
      throwOnErrors({ errors: [{ message: "a" }, { message: "b" }] }),
    ).toThrow("a; b");
  });
});

describe("queryKeys", () => {
  it("scopes month data by the MM/yy string", () => {
    expect(queryKeys.budget("11/26")).toEqual(["budget", "11/26"]);
    expect(queryKeys.transactions("11/26").slice(0, 1)).toEqual(
      queryKeys.allTransactions(),
    );
    expect(queryKeys.budgets()).toEqual(["budget"]);
    expect([
      queryKeys.accounts(),
      queryKeys.plaidConnections(),
      queryKeys.plaidReauth(),
      queryKeys.syncHistory(),
    ]).toHaveLength(4);
  });
});
