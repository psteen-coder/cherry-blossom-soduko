import { describe, expect, it } from "vitest";
import { SudokuGame } from "./kernel";
import {
  SAVE_KEY,
  hasInProgressSave,
  writeInProgressSave,
  type SaveStore,
} from "./save";

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

describe("writeInProgressSave", () => {
  it("writes a playing snapshot so Continue can enable", () => {
    const store = memoryStore();
    const game = SudokuGame.generate("easy", 11);
    writeInProgressSave(store, game);
    expect(hasInProgressSave(store)).toBe(true);
    const raw = store.getItem(SAVE_KEY);
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!) as { status: string; difficulty: string };
    expect(data.status).toBe("playing");
    expect(data.difficulty).toBe("easy");
  });
});
