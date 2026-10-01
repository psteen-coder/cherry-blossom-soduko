import {
  SudokuGame,
  type Clock,
  type Difficulty,
  type GameSnapshot,
} from "./kernel";

export const SAVE_KEY = "cherry-blossom-soduko:save";

export type SaveStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type SavedGame = GameSnapshot & {
  status: "playing" | "won";
};

export function defaultSaveStore(): SaveStore | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    return storage;
  } catch {
    return null;
  }
}

export function hasInProgressSave(
  store: SaveStore | null = defaultSaveStore(),
): boolean {
  if (!store) return false;
  const raw = store.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return false;
    return (data as { status?: unknown }).status === "playing";
  } catch {
    return false;
  }
}

export function writeInProgressSave(
  store: SaveStore | null,
  game: SudokuGame,
): void {
  if (!store) return;
  const snap = game.snapshot();
  const payload: SavedGame = { ...snap, status: "playing" };
  store.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function persistGame(
  store: SaveStore | null,
  game: SudokuGame,
): void {
  if (!store) return;
  if (game.isComplete()) {
    const snap = game.snapshot();
    const payload: SavedGame = { ...snap, status: "won" };
    store.setItem(SAVE_KEY, JSON.stringify(payload));
    return;
  }
  writeInProgressSave(store, game);
}

export function clearInProgressSave(store: SaveStore | null): void {
  if (!store) return;
  store.removeItem(SAVE_KEY);
}

export function restoreGame(
  store: SaveStore | null,
  opts?: { now?: Clock },
): SudokuGame | null {
  if (!store) return null;
  const raw = store.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const rec = data as {
      status?: unknown;
      difficulty?: unknown;
      seed?: unknown;
      elapsedSeconds?: unknown;
      puzzle?: unknown;
      values?: unknown;
      solution?: unknown;
    };
    if (rec.status !== "playing") return null;
    if (
      rec.difficulty !== "easy" &&
      rec.difficulty !== "medium" &&
      rec.difficulty !== "hard"
    ) {
      return null;
    }
    if (!isGrid(rec.puzzle) || !isGrid(rec.values) || !isGrid(rec.solution)) {
      return null;
    }
    return SudokuGame.restore(
      {
        difficulty: rec.difficulty as Difficulty,
        seed: Number(rec.seed) || 0,
        elapsedSeconds: Number(rec.elapsedSeconds) || 0,
        puzzle: rec.puzzle,
        values: rec.values,
        solution: rec.solution,
      },
      opts,
    );
  } catch {
    return null;
  }
}

function isGrid(value: unknown): value is number[][] {
  if (!Array.isArray(value) || value.length !== 9) return false;
  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every((cell) => typeof cell === "number"),
  );
}
