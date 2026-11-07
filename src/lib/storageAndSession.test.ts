import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readJson, removeKey, toggleInList, writeJson } from "./browserStorage";
import {
  clearSession,
  isOAuthReturn,
  loadSession,
  saveSession,
  withoutOAuthParams,
} from "./plaidSession";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

describe("browserStorage", () => {
  beforeEach(() => vi.stubGlobal("window", { localStorage: memoryStorage() }));
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips JSON and falls back when missing", () => {
    expect(readJson("k", ["fallback"])).toEqual(["fallback"]);
    writeJson("k", ["Income"]);
    expect(readJson("k", [])).toEqual(["Income"]);
    removeKey("k");
    expect(readJson("k", null)).toBeNull();
  });

  it("never throws when storage is unavailable", () => {
    const broken = () => {
      throw new Error("blocked");
    };
    vi.stubGlobal("window", {
      localStorage: { getItem: broken, setItem: broken, removeItem: broken },
    });
    expect(readJson("k", 1)).toBe(1);
    expect(() => writeJson("k", 1)).not.toThrow();
    expect(() => removeKey("k")).not.toThrow();
  });

  it("toggles list membership", () => {
    expect(toggleInList(["Wants"], "Income", true)).toEqual([
      "Income",
      "Wants",
    ]);
    expect(toggleInList(["Income", "Wants"], "Income", false)).toEqual([
      "Wants",
    ]);
  });

  it("persists the in-flight Plaid Link session for OAuth resume", () => {
    expect(loadSession()).toBeNull();
    saveSession({ token: "link-1", mode: "reauth", connectionId: "c" });
    expect(loadSession()).toEqual({
      token: "link-1",
      mode: "reauth",
      connectionId: "c",
    });
    clearSession();
    expect(loadSession()).toBeNull();
  });
});

describe("OAuth redirect detection", () => {
  it("recognizes Plaid's return URL and strips its parameter", () => {
    const back = "https://finance.jpc.io/?oauth_state_id=abc&tab=1";
    expect(isOAuthReturn(back)).toBe(true);
    expect(isOAuthReturn("https://finance.jpc.io/")).toBe(false);
    expect(isOAuthReturn("not a url")).toBe(false);
    expect(withoutOAuthParams(back)).toBe("https://finance.jpc.io/?tab=1");
  });
});
