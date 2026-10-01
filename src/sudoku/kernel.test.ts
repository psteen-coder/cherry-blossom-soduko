import { describe, expect, it } from "vitest";
import {
  CLUE_COUNTS,
  SudokuGame,
  countSolutions,
} from "./kernel";

function givenCount(game: SudokuGame): number {
  let n = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (game.cell(r, c).given) n++;
    }
  }
  return n;
}

function puzzleGrid(game: SudokuGame): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      const cell = game.cell(r, c);
      row.push(cell.given && cell.value !== null ? cell.value : 0);
    }
    grid.push(row);
  }
  return grid;
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

describe("clue counts", () => {
  it("locks Easy 40 / Medium 30 / Hard 22", () => {
    expect(CLUE_COUNTS.easy).toBe(40);
    expect(CLUE_COUNTS.medium).toBe(30);
    expect(CLUE_COUNTS.hard).toBe(22);
  });
});

describe("generate unique solution", () => {
  it.each([
    ["easy", 40, 11],
    ["medium", 30, 23],
    ["hard", 22, 47],
  ] as const)(
    "%s has %i given clues and exactly one solution",
    (difficulty, clues, seed) => {
      const game = SudokuGame.generate(difficulty, seed);
      expect(game.size).toBe(9);
      expect(givenCount(game)).toBe(clues);
      expect(countSolutions(puzzleGrid(game))).toBe(1);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = game.cell(r, c);
          if (cell.given) {
            expect(cell.value).toBe(game.solutionAt(r, c));
          } else {
            expect(cell.value).toBeNull();
          }
        }
      }
    },
  );

  it("is deterministic for the same seed", () => {
    const a = SudokuGame.generate("medium", 99);
    const b = SudokuGame.generate("medium", 99);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(a.cell(r, c).value).toBe(b.cell(r, c).value);
        expect(a.cell(r, c).given).toBe(b.cell(r, c).given);
        expect(a.solutionAt(r, c)).toBe(b.solutionAt(r, c));
      }
    }
  });
});

describe("place and clear", () => {
  it("rejects overwriting a given cell", () => {
    const game = SudokuGame.generate("easy", 7);
    let given: { row: number; col: number; value: number } | null = null;
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = game.cell(r, c);
        if (cell.given && cell.value !== null) {
          given = { row: r, col: c, value: cell.value };
          break outer;
        }
      }
    }
    expect(given).not.toBeNull();
    const other = given!.value === 9 ? 1 : given!.value + 1;
    const result = game.place(given!.row, given!.col, other);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("given");
    expect(game.cell(given!.row, given!.col).value).toBe(given!.value);
    const cleared = game.clear(given!.row, given!.col);
    expect(cleared.ok).toBe(false);
    if (!cleared.ok) expect(cleared.reason).toBe("given");
    expect(game.cell(given!.row, given!.col).value).toBe(given!.value);
  });

  it("rejects invalid place (wrong digit type / given cell)", () => {
    const game = SudokuGame.generate("easy", 3);
    let empty: { row: number; col: number } | null = null;
    let given: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = game.cell(r, c);
        if (!empty && !cell.given) empty = { row: r, col: c };
        if (!given && cell.given) given = { row: r, col: c };
      }
    }
    expect(empty).not.toBeNull();
    expect(given).not.toBeNull();

    for (const digit of [0, 10, -1, 1.5, Number.NaN, 9.2]) {
      const result = game.place(empty!.row, empty!.col, digit);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("invalid");
      expect(game.cell(empty!.row, empty!.col).value).toBeNull();
    }

    const givenHit = game.place(given!.row, given!.col, 5);
    expect(givenHit.ok).toBe(false);
    if (!givenHit.ok) expect(givenHit.reason).toBe("given");
  });

  it("places and clears a non-given cell, including overwrite of own entry", () => {
    const game = SudokuGame.generate("easy", 5);
    let empty: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!game.cell(r, c).given) {
          empty = { row: r, col: c };
          break;
        }
      }
      if (empty) break;
    }
    expect(empty).not.toBeNull();
    expect(game.place(empty!.row, empty!.col, 4).ok).toBe(true);
    expect(game.cell(empty!.row, empty!.col).value).toBe(4);
    expect(game.place(empty!.row, empty!.col, 8).ok).toBe(true);
    expect(game.cell(empty!.row, empty!.col).value).toBe(8);
    expect(game.clear(empty!.row, empty!.col).ok).toBe(true);
    expect(game.cell(empty!.row, empty!.col).value).toBeNull();
  });
});

describe("complete and timer", () => {
  it("completing a seeded puzzle returns isComplete true and elapsed >= 0", () => {
    let t = 1_000_000;
    const game = SudokuGame.generate("easy", 13, { now: () => t });
    expect(game.isComplete()).toBe(false);
    expect(game.elapsedSeconds()).toBe(0);
    fillFromSolution(game);
    expect(game.isComplete()).toBe(true);
    expect(game.elapsedSeconds()).toBeGreaterThanOrEqual(0);
    t += 2500;
    expect(game.elapsedSeconds()).toBe(2);
  });

  it("incomplete or conflicting board is not complete", () => {
    const game = SudokuGame.generate("easy", 17);
    expect(game.isComplete()).toBe(false);

    let empty: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!game.cell(r, c).given) {
          empty = { row: r, col: c };
          break;
        }
      }
      if (empty) break;
    }
    expect(empty).not.toBeNull();
    expect(game.place(empty!.row, empty!.col, game.solutionAt(empty!.row, empty!.col)).ok).toBe(
      true,
    );
    expect(game.isComplete()).toBe(false);

    const conflicted = SudokuGame.generate("easy", 19);
    let playable: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!conflicted.cell(r, c).given) {
          playable = { row: r, col: c };
          break;
        }
      }
      if (playable) break;
    }
    expect(playable).not.toBeNull();
    fillFromSolution(conflicted);
    expect(conflicted.isComplete()).toBe(true);
    const correct = conflicted.solutionAt(playable!.row, playable!.col);
    const wrong = correct === 9 ? 1 : 9;
    expect(conflicted.place(playable!.row, playable!.col, wrong).ok).toBe(true);
    expect(conflicted.cell(playable!.row, playable!.col).conflict).toBe(true);
    expect(conflicted.isComplete()).toBe(false);
  });
});
