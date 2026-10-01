import { describe, expect, it } from "vitest";
import { SAVE_KEY, hasInProgressSave, type SaveStore } from "./save";

function memoryStore(initial: Record<string, string> = {}): SaveStore {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

describe("hasInProgressSave", () => {
  it("is false with an empty store (cold start)", () => {
    expect(hasInProgressSave(memoryStore())).toBe(false);
  });

  it("is false when the save key is missing", () => {
    expect(hasInProgressSave(memoryStore({ other: "{}" }))).toBe(false);
  });

  it("is false for junk JSON", () => {
    expect(hasInProgressSave(memoryStore({ [SAVE_KEY]: "not-json" }))).toBe(
      false,
    );
  });

  it("is false when status is not playing", () => {
    expect(
      hasInProgressSave(
        memoryStore({ [SAVE_KEY]: JSON.stringify({ status: "won" }) }),
      ),
    ).toBe(false);
  });

  it("is true for an in-progress playing save", () => {
    expect(
      hasInProgressSave(
        memoryStore({ [SAVE_KEY]: JSON.stringify({ status: "playing" }) }),
      ),
    ).toBe(true);
  });
});
