import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";
import PlayField from "../components/PlayField";
import { SudokuGame } from "./kernel";
import {
  SCORES_KEY,
  isHighScore,
  lastUsedName,
  readScores,
  recordScore,
  scoresForDifficulty,
  type ScoreStore,
} from "./scores";
import type { SaveStore } from "./save";

function memoryStore(initial: Record<string, string> = {}): ScoreStore & SaveStore {
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

describe("recordScore", () => {
  it("stores { name, difficulty, timeSeconds, at } in cherry-blossom-soduko:scores", () => {
    const store = memoryStore();
    recordScore(store, {
      name: "Pat",
      difficulty: "easy",
      timeSeconds: 94,
      at: 1_700_000_000_000,
    });
    const raw = store.getItem(SCORES_KEY);
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!) as Array<{
      name: string;
      difficulty: string;
      timeSeconds: number;
      at: number;
    }>;
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      name: "Pat",
      difficulty: "easy",
      timeSeconds: 94,
      at: 1_700_000_000_000,
    });
    expect(readScores(store)[0].name).toBe("Pat");
  });

  it("reload still shows that row", () => {
    const store = memoryStore();
    recordScore(store, {
      name: "Pat",
      difficulty: "medium",
      timeSeconds: 180,
      at: 10,
    });
    const reloaded = memoryStore({
      [SCORES_KEY]: store.getItem(SCORES_KEY)!,
    });
    const rows = scoresForDifficulty(reloaded, "medium");
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Pat");
    expect(rows[0].timeSeconds).toBe(180);
  });

  it("sorts each difficulty fastest first", () => {
    const store = memoryStore();
    recordScore(store, { name: "Slow", difficulty: "easy", timeSeconds: 200, at: 1 });
    recordScore(store, { name: "Fast", difficulty: "easy", timeSeconds: 80, at: 2 });
    recordScore(store, { name: "Mid", difficulty: "easy", timeSeconds: 120, at: 3 });
    recordScore(store, { name: "HardWin", difficulty: "hard", timeSeconds: 400, at: 4 });
    expect(scoresForDifficulty(store, "easy").map((s) => s.name)).toEqual([
      "Fast",
      "Mid",
      "Slow",
    ]);
    expect(scoresForDifficulty(store, "hard").map((s) => s.name)).toEqual([
      "HardWin",
    ]);
    expect(scoresForDifficulty(store, "medium")).toEqual([]);
  });
});

describe("isHighScore", () => {
  it("is true for the first score on a difficulty", () => {
    const store = memoryStore();
    expect(isHighScore(store, "easy", 999)).toBe(true);
  });

  it("a faster time on the same difficulty is the new high score", () => {
    const store = memoryStore();
    recordScore(store, { name: "Pat", difficulty: "easy", timeSeconds: 100, at: 1 });
    expect(isHighScore(store, "easy", 99)).toBe(true);
    expect(isHighScore(store, "easy", 100)).toBe(false);
    expect(isHighScore(store, "easy", 101)).toBe(false);
    expect(isHighScore(store, "medium", 500)).toBe(true);
  });
});

describe("lastUsedName", () => {
  it("defaults empty then remembers the last recorded name", () => {
    const store = memoryStore();
    expect(lastUsedName(store)).toBe("");
    recordScore(store, { name: "Pat", difficulty: "easy", timeSeconds: 50, at: 1 });
    expect(lastUsedName(store)).toBe("Pat");
    recordScore(store, { name: "Chris", difficulty: "hard", timeSeconds: 90, at: 2 });
    expect(lastUsedName(store)).toBe("Chris");
  });
});

describe("seeded win records typed name on the board", () => {
  it("a completed seeded puzzle shows a name prompt defaulting to last used name", () => {
    const store = memoryStore();
    recordScore(store, { name: "Pat", difficulty: "easy", timeSeconds: 200, at: 1 });
    const game = SudokuGame.generate("easy", 11);
    fillFromSolution(game);
    expect(game.isComplete()).toBe(true);
    const html = renderToString(
      createElement(PlayField, {
        game,
        onMenu: () => {},
        scoreStore: store,
      }),
    );
    expect(html).toContain('data-testid="name-prompt"');
    expect(html).toContain('data-testid="score-name"');
    expect(html).toContain('value="Pat"');
  });

  it("leaderboard lists Easy / Medium / Hard sections with recorded names", () => {
    const store = memoryStore();
    recordScore(store, { name: "Pat", difficulty: "easy", timeSeconds: 94, at: 1 });
    recordScore(store, { name: "Ada", difficulty: "hard", timeSeconds: 301, at: 2 });
    const html = renderToString(
      createElement(App, {
        saveStore: store,
        themeStore: store,
        scoreStore: store,
        screen: "leaderboard",
      }),
    );
    expect(html).toContain('data-testid="leaderboard-screen"');
    expect(html).not.toContain("Times land in a later ticket");
    expect(html).toContain("Easy");
    expect(html).toContain("Medium");
    expect(html).toContain("Hard");
    expect(html).toContain("Pat");
    expect(html).toContain("Ada");
    expect(html).toContain('data-testid="score-easy-0"');
    expect(html).toContain('data-testid="score-hard-0"');
    expect(html).toContain('data-testid="leaderboard-back"');
  });
});
