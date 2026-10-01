import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";
import Settings from "../components/Settings";
import {
  THEME_KEY,
  THEME_NAMES,
  applyTheme,
  defaultThemeStore,
  isThemeId,
  readTheme,
  writeTheme,
  type ThemeId,
  type ThemeStore,
} from "./theme";
import type { SaveStore } from "./save";

function memoryStore(initial: Record<string, string> = {}): ThemeStore & SaveStore {
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

describe("theme catalog", () => {
  it("lists exactly Dark, Light, Sakura, Sage, Lavender, Peach", () => {
    expect(THEME_NAMES).toEqual([
      "Dark",
      "Light",
      "Sakura",
      "Sage",
      "Lavender",
      "Peach",
    ]);
  });

  it("accepts the six ids and rejects unknown values", () => {
    const ids: ThemeId[] = [
      "dark",
      "light",
      "sakura",
      "sage",
      "lavender",
      "peach",
    ];
    for (const id of ids) expect(isThemeId(id)).toBe(true);
    expect(isThemeId("neon")).toBe(false);
    expect(isThemeId("Dark")).toBe(false);
  });
});

describe("theme persist", () => {
  it("defaults to dark when nothing is stored", () => {
    expect(readTheme(memoryStore())).toBe("dark");
  });

  it("writes cherry-blossom-soduko:theme and reads it back", () => {
    const store = memoryStore();
    writeTheme(store, "lavender");
    expect(store.getItem(THEME_KEY)).toBe("lavender");
    expect(readTheme(store)).toBe("lavender");
  });

  it("falls back to dark for junk or unknown stored values", () => {
    expect(readTheme(memoryStore({ [THEME_KEY]: "neon" }))).toBe("dark");
    expect(readTheme(memoryStore({ [THEME_KEY]: "" }))).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("sets data-theme on the given root", () => {
    const root = { dataset: {} as Record<string, string> };
    applyTheme("dark", root);
    expect(root.dataset.theme).toBe("dark");
    applyTheme("peach", root);
    expect(root.dataset.theme).toBe("peach");
  });
});

describe("Settings screen", () => {
  it("lists exactly those six names", () => {
    const html = renderToString(
      createElement(Settings, {
        theme: "dark",
        onChoose: () => {},
        onBack: () => {},
      }),
    );
    expect(html).toContain("data-testid=\"settings-screen\"");
    for (const name of [
      "Dark",
      "Light",
      "Sakura",
      "Sage",
      "Lavender",
      "Peach",
    ]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("data-testid=\"theme-dark\"");
    expect(html).toContain("data-testid=\"theme-light\"");
    expect(html).toContain("data-testid=\"theme-sakura\"");
    expect(html).toContain("data-testid=\"theme-sage\"");
    expect(html).toContain("data-testid=\"theme-lavender\"");
    expect(html).toContain("data-testid=\"theme-peach\"");
    expect(html).toContain("data-testid=\"settings-back\"");
    expect(html.match(/data-testid="theme-/g)?.length).toBe(6);
  });

  it("App settings screen mounts the six themes, not the stub copy", () => {
    const html = renderToString(
      createElement(App, {
        saveStore: memoryStore(),
        themeStore: memoryStore(),
        screen: "settings",
      }),
    );
    expect(html).toContain("data-testid=\"settings-screen\"");
    expect(html).toContain("Dark");
    expect(html).toContain("Sakura");
    expect(html).not.toContain("Six themes land in a later ticket");
  });
});

describe("defaultThemeStore", () => {
  it("is a function that does not throw in node", () => {
    expect(typeof defaultThemeStore).toBe("function");
    expect(() => defaultThemeStore()).not.toThrow();
  });
});
