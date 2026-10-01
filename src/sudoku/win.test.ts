import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PlayField from "../components/PlayField";
import { SudokuGame } from "./kernel";
import { formatElapsed } from "./play";
import { recordScore, type ScoreStore } from "./scores";
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

function renderWin(store: ScoreStore, elapsedSeconds = 94): string {
  let now = 1_000;
  const game = SudokuGame.generate("easy", 11, { now: () => now });
  fillFromSolution(game);
  now = 1_000 + elapsedSeconds * 1000;
  expect(game.isComplete()).toBe(true);
  expect(game.elapsedSeconds()).toBe(elapsedSeconds);
  return renderToString(
    createElement(PlayField, {
      game,
      onMenu: () => {},
      scoreStore: store,
    }),
  );
}

describe("win overlay", () => {
  it("seeded complete shows overlay with elapsed time", () => {
    const html = renderWin(memoryStore());
    expect(html).toContain('data-testid="win-overlay"');
    expect(html).toContain('data-testid="win-time"');
    expect(html).toContain(formatElapsed(94));
  });

  it("overlay contains falling petal nodes", () => {
    const html = renderWin(memoryStore());
    expect(html).toContain('data-testid="win-petal"');
    expect(html).toContain("falling-petal");
    const petals = html.match(/data-testid="win-petal"/g) ?? [];
    expect(petals.length).toBeGreaterThanOrEqual(8);
  });

  it("first score or faster-than-best sets glitter; slower does not", () => {
    const first = renderWin(memoryStore());
    expect(first).toMatch(/data-testid="win-overlay"[^>]*data-glitter="true"/);

    const slowerStore = memoryStore();
    recordScore(slowerStore, {
      name: "Pat",
      difficulty: "easy",
      timeSeconds: 50,
      at: 1,
    });
    const slower = renderWin(slowerStore);
    expect(slower).toMatch(/data-testid="win-overlay"[^>]*data-glitter="false"/);
    expect(slower).not.toMatch(/data-testid="win-overlay"[^>]*data-glitter="true"/);

    const fasterStore = memoryStore();
    recordScore(fasterStore, {
      name: "Pat",
      difficulty: "easy",
      timeSeconds: 200,
      at: 1,
    });
    const faster = renderWin(fasterStore);
    expect(faster).toMatch(/data-testid="win-overlay"[^>]*data-glitter="true"/);
  });
});
