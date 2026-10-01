import { describe, expect, it } from "vitest";
import { SudokuGame } from "./kernel";
import {
  SAVE_KEY,
  clearInProgressSave,
  hasInProgressSave,
  persistGame,
  restoreGame,
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

function findEmpty(game: SudokuGame): { row: number; col: number } {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!game.cell(r, c).given && game.cell(r, c).value === null) {
        return { row: r, col: c };
      }
    }
  }
  throw new Error("no empty cell");
}

function fillFromSolution(game: SudokuGame): void {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!game.cell(r, c).given) {
        const result = game.place(r, c, game.solutionAt(r, c));
        expect(result.ok).toBe(true);
      }
    }
  }
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

  it("stores board, givens, entries, difficulty, and timer", () => {
    let t = 1_000_000;
    const game = SudokuGame.generate("medium", 23, { now: () => t });
    const empty = findEmpty(game);
    expect(game.place(empty.row, empty.col, 5).ok).toBe(true);
    t += 4_000;
    const store = memoryStore();
    writeInProgressSave(store, game);
    const data = JSON.parse(store.getItem(SAVE_KEY)!) as {
      status: string;
      difficulty: string;
      seed: number;
      elapsedSeconds: number;
      puzzle: number[][];
      values: number[][];
    };
    expect(data.status).toBe("playing");
    expect(data.difficulty).toBe("medium");
    expect(data.seed).toBe(23);
    expect(data.elapsedSeconds).toBe(4);
    expect(data.puzzle).toHaveLength(9);
    expect(data.values).toHaveLength(9);
    expect(data.puzzle[empty.row][empty.col]).toBe(0);
    expect(data.values[empty.row][empty.col]).toBe(5);
    expect(game.cell(empty.row, empty.col).given).toBe(false);
  });
});

describe("restoreGame", () => {
  it("restores board, givens, entries, difficulty, and timer ≥ prior", () => {
    let t = 5_000_000;
    const game = SudokuGame.generate("easy", 11, { now: () => t });
    const empty = findEmpty(game);
    expect(game.place(empty.row, empty.col, 7).ok).toBe(true);
    t += 3_000;
    const prior = game.elapsedSeconds();
    expect(prior).toBe(3);

    const store = memoryStore();
    writeInProgressSave(store, game);

    let t2 = 9_000_000;
    const restored = restoreGame(store, { now: () => t2 });
    expect(restored).not.toBeNull();
    expect(restored!.difficulty).toBe("easy");
    expect(restored!.seed).toBe(11);
    expect(restored!.cell(empty.row, empty.col).value).toBe(7);
    expect(restored!.cell(empty.row, empty.col).given).toBe(false);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(restored!.cell(r, c).given).toBe(game.cell(r, c).given);
        if (game.cell(r, c).given) {
          expect(restored!.cell(r, c).value).toBe(game.cell(r, c).value);
        }
      }
    }
    expect(restored!.elapsedSeconds()).toBeGreaterThanOrEqual(prior);
    t2 += 1_000;
    expect(restored!.elapsedSeconds()).toBeGreaterThanOrEqual(prior + 1);
  });

  it("returns null when there is no in-progress save", () => {
    expect(restoreGame(memoryStore())).toBeNull();
  });
});

describe("persistGame", () => {
  it("autosaves a playing game after a place", () => {
    const store = memoryStore();
    const game = SudokuGame.generate("easy", 11);
    const empty = findEmpty(game);
    expect(game.place(empty.row, empty.col, 4).ok).toBe(true);
    persistGame(store, game);
    expect(hasInProgressSave(store)).toBe(true);
    const restored = restoreGame(store);
    expect(restored!.cell(empty.row, empty.col).value).toBe(4);
  });

  it("autosaves a clear so the cell is empty after restore", () => {
    const store = memoryStore();
    const game = SudokuGame.generate("easy", 11);
    const empty = findEmpty(game);
    expect(game.place(empty.row, empty.col, 4).ok).toBe(true);
    persistGame(store, game);
    expect(game.clear(empty.row, empty.col).ok).toBe(true);
    persistGame(store, game);
    const restored = restoreGame(store);
    expect(restored!.cell(empty.row, empty.col).value).toBeNull();
    expect(hasInProgressSave(store)).toBe(true);
  });

  it("disables Continue after a win (status won, not playing)", () => {
    const store = memoryStore();
    const game = SudokuGame.generate("easy", 11);
    fillFromSolution(game);
    expect(game.isComplete()).toBe(true);
    persistGame(store, game);
    expect(hasInProgressSave(store)).toBe(false);
    const raw = store.getItem(SAVE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).status).toBe("won");
    expect(restoreGame(store)).toBeNull();
  });
});

describe("clearInProgressSave", () => {
  it("New Game clears the in-progress save so Continue is disabled", () => {
    const store = memoryStore();
    const game = SudokuGame.generate("easy", 11);
    const empty = findEmpty(game);
    expect(game.place(empty.row, empty.col, 3).ok).toBe(true);
    persistGame(store, game);
    expect(hasInProgressSave(store)).toBe(true);
    clearInProgressSave(store);
    expect(hasInProgressSave(store)).toBe(false);
    expect(restoreGame(store)).toBeNull();
  });
});
