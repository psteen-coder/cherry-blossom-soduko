import type { PlaceResult, SudokuGame } from "./kernel";

export type TapResult = PlaceResult | { ok: false; reason: "no-tool" };

export class PlaySession {
  selectedDigit: number | null = null;
  eraseSelected = false;

  constructor(readonly game: SudokuGame) {}

  selectDigit(digit: number): void {
    this.selectedDigit = digit;
    this.eraseSelected = false;
  }

  selectErase(): void {
    this.eraseSelected = true;
    this.selectedDigit = null;
  }

  tapCell(row: number, col: number): TapResult {
    if (this.eraseSelected) {
      return this.game.clear(row, col);
    }
    if (this.selectedDigit === null) {
      return { ok: false, reason: "no-tool" };
    }
    return this.game.place(row, col, this.selectedDigit);
  }
}

export function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
