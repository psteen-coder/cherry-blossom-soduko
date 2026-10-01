import { describe, expect, it } from "vitest";
import { SudokuGame } from "./kernel";
import { formatElapsed, PlaySession } from "./play";

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

function findGiven(game: SudokuGame): { row: number; col: number; value: number } {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = game.cell(r, c);
      if (cell.given && cell.value !== null) {
        return { row: r, col: c, value: cell.value };
      }
    }
  }
  throw new Error("no given cell");
}

describe("digit then cell", () => {
  it("selecting 5 then tapping an empty cell writes 5", () => {
    const game = SudokuGame.generate("easy", 11);
    const session = new PlaySession(game);
    const empty = findEmpty(game);
    session.selectDigit(5);
    expect(session.selectedDigit).toBe(5);
    const result = session.tapCell(empty.row, empty.col);
    expect(result.ok).toBe(true);
    expect(game.cell(empty.row, empty.col).value).toBe(5);
    expect(session.selectedDigit).toBe(5);
  });

  it("tapping a given cell does not change it", () => {
    const game = SudokuGame.generate("easy", 11);
    const session = new PlaySession(game);
    const given = findGiven(game);
    session.selectDigit(5);
    const result = session.tapCell(given.row, given.col);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("given");
    expect(game.cell(given.row, given.col).value).toBe(given.value);
    expect(game.cell(given.row, given.col).given).toBe(true);
  });

  it("erase clears a player cell, not a given", () => {
    const game = SudokuGame.generate("easy", 11);
    const session = new PlaySession(game);
    const empty = findEmpty(game);
    const given = findGiven(game);
    session.selectDigit(5);
    expect(session.tapCell(empty.row, empty.col).ok).toBe(true);
    session.selectErase();
    expect(session.selectedDigit).toBeNull();
    expect(session.eraseSelected).toBe(true);
    expect(session.tapCell(empty.row, empty.col).ok).toBe(true);
    expect(game.cell(empty.row, empty.col).value).toBeNull();
    expect(session.tapCell(given.row, given.col).ok).toBe(false);
    expect(game.cell(given.row, given.col).value).toBe(given.value);
  });

  it("tapping a cell with no digit selected does nothing", () => {
    const game = SudokuGame.generate("easy", 11);
    const session = new PlaySession(game);
    const empty = findEmpty(game);
    const result = session.tapCell(empty.row, empty.col);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("no-tool");
    expect(game.cell(empty.row, empty.col).value).toBeNull();
  });
});

describe("formatElapsed", () => {
  it("renders m:ss", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(5)).toBe("0:05");
    expect(formatElapsed(75)).toBe("1:15");
  });
});
