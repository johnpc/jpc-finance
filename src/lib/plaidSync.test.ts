import { describe, expect, it } from "vitest";
import {
  bankDisplayName,
  connectionsNeedingReauth,
  parsePlaidSyncResponse,
  syncErrorSummary,
  syncSummary,
  tokenPrefix,
} from "./plaidSync";

const token = "access-production-1234567890-abcdef";

describe("parsePlaidSyncResponse", () => {
  it("reads the created count and per-bank errors", () => {
    const result = parsePlaidSyncResponse({
      newTransactionCount: 3,
      errors: [
        {
          accessToken: tokenPrefix(token),
          error_code: "ITEM_LOGIN_REQUIRED",
          error_message: "log in",
        },
      ],
    });
    expect(result.newTransactionCount).toBe(3);
    expect(result.errors).toEqual([
      {
        code: "ITEM_LOGIN_REQUIRED",
        message: "log in",
        tokenPrefix: "access-production-12...",
      },
    ]);
  });

  it("tolerates missing fields and non-object bodies", () => {
    expect(parsePlaidSyncResponse(null)).toEqual({
      newTransactionCount: 0,
      errors: [],
    });
    expect(parsePlaidSyncResponse({ errors: [{}] }).errors[0]).toEqual({
      code: "UNKNOWN",
      message: "Unknown error",
      tokenPrefix: undefined,
    });
  });
});

describe("connectionsNeedingReauth", () => {
  it("matches the Lambda's truncated token back to the connection", () => {
    const connections = [
      { id: "a", accessToken: token },
      { id: "b", accessToken: "access-production-other-token-xyz" },
    ];
    const result = parsePlaidSyncResponse({
      errors: [
        { accessToken: tokenPrefix(token), error_code: "ITEM_LOGIN_REQUIRED" },
        {
          accessToken: tokenPrefix(connections[1].accessToken),
          error_code: "INTERNAL_SERVER_ERROR",
        },
      ],
    });
    expect(connectionsNeedingReauth(result, connections)).toEqual(["a"]);
  });
});

describe("summaries", () => {
  it("describes the outcome", () => {
    expect(syncSummary({ newTransactionCount: 0, errors: [] })).toBe(
      "Everything was already up to date",
    );
    expect(syncSummary({ newTransactionCount: 1, errors: [] })).toBe(
      "1 new transaction synced",
    );
    expect(syncSummary({ newTransactionCount: 4, errors: [] })).toBe(
      "4 new transactions synced",
    );
  });

  it("points at the right place for each kind of failure", () => {
    expect(syncErrorSummary({ newTransactionCount: 0, errors: [] })).toBeNull();
    expect(
      syncErrorSummary({
        newTransactionCount: 0,
        errors: [{ code: "ITEM_LOGIN_REQUIRED", message: "" }],
      }),
    ).toMatch(/Linked Banks/);
    expect(
      syncErrorSummary({
        newTransactionCount: 0,
        errors: [{ code: "RATE_LIMIT", message: "" }],
      }),
    ).toMatch(/Sync History/);
  });

  it("labels banks without a captured institution name", () => {
    expect(bankDisplayName({ institutionName: "Chase" })).toBe("Chase");
    expect(bankDisplayName({ institutionName: null })).toBe("Bank Connection");
  });
});
