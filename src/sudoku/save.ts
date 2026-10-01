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
