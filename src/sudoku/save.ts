export const SAVE_KEY = "cherry-blossom-soduko:save";

export type SaveStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
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
  game: { difficulty: string; seed: number; elapsedSeconds(): number },
): void {
  if (!store) return;
  store.setItem(
    SAVE_KEY,
    JSON.stringify({
      status: "playing",
      difficulty: game.difficulty,
      seed: game.seed,
      elapsedSeconds: game.elapsedSeconds(),
    }),
  );
}
