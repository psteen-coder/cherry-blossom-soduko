export const THEME_KEY = "cherry-blossom-soduko:theme";

export const THEMES = [
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "sakura", name: "Sakura" },
  { id: "sage", name: "Sage" },
  { id: "lavender", name: "Lavender" },
  { id: "peach", name: "Peach" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type ThemeName = (typeof THEMES)[number]["name"];

export const THEME_NAMES: ThemeName[] = THEMES.map((theme) => theme.name);

export const DEFAULT_THEME: ThemeId = "dark";

export type ThemeStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type ThemeRoot = {
  dataset: { theme?: string };
};

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function defaultThemeStore(): ThemeStore | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    return storage;
  } catch {
    return null;
  }
}

export function readTheme(
  store: ThemeStore | null = defaultThemeStore(),
): ThemeId {
  if (!store) return DEFAULT_THEME;
  const raw = store.getItem(THEME_KEY);
  return isThemeId(raw) ? raw : DEFAULT_THEME;
}

export function writeTheme(
  store: ThemeStore | null,
  id: ThemeId,
): void {
  if (!store) return;
  store.setItem(THEME_KEY, id);
}

export function applyTheme(
  id: ThemeId,
  root?: ThemeRoot | null,
): void {
  const target =
    root ??
    (typeof document !== "undefined" ? document.documentElement : null);
  if (!target) return;
  target.dataset.theme = id;
}

export function applyStoredTheme(
  store: ThemeStore | null = defaultThemeStore(),
  root?: ThemeRoot | null,
): ThemeId {
  const id = readTheme(store);
  applyTheme(id, root);
  return id;
}
