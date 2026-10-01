import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";
import { SAVE_KEY, type SaveStore } from "./save";

function memoryStore(initial: Record<string, string> = {}): SaveStore {
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

function renderApp(
  props: {
    saveStore?: SaveStore;
    screen?: "menu" | "difficulty" | "play" | "settings" | "leaderboard";
    seed?: number;
    difficulty?: "easy" | "medium" | "hard";
  } = {},
): string {
  return renderToString(createElement(App, props));
}

describe("main menu", () => {
  it("first paint is the menu titled Cherry Blossom Soduko", () => {
    const html = renderApp();
    expect(html).toContain("Cherry Blossom Soduko");
    expect(html).toContain("data-testid=\"menu-screen\"");
    expect(html).not.toContain("data-testid=\"play-field\"");
    expect(html).not.toContain("Get started");
  });

  it("renders blossom border art layers", () => {
    const html = renderApp();
    expect(html).toContain("data-testid=\"blossom-border\"");
    expect(html).toContain("data-testid=\"blossom-border-top\"");
    expect(html).toContain("data-testid=\"blossom-border-bottom\"");
    expect(html).toContain("data-testid=\"blossom-border-left\"");
    expect(html).toContain("data-testid=\"blossom-border-right\"");
    expect(html).toContain("aria-hidden=\"true\"");
  });

  it("has four menu actions and Continue disabled with no save", () => {
    const html = renderApp({ saveStore: memoryStore() });
    expect(html).toContain("data-testid=\"new-game\"");
    expect(html).toContain("data-testid=\"continue\"");
    expect(html).toContain("data-testid=\"settings\"");
    expect(html).toContain("data-testid=\"leaderboard\"");
    expect(html).toMatch(/data-testid="continue"[^>]*\sdisabled/);
  });

  it("enables Continue when an in-progress save exists", () => {
    const html = renderApp({
      saveStore: memoryStore({
        [SAVE_KEY]: JSON.stringify({ status: "playing" }),
      }),
    });
    expect(html).toContain("data-testid=\"continue\"");
    expect(html).toContain('aria-disabled="false"');
    expect(html).not.toMatch(/data-testid="continue"[^>]*\sdisabled/);
  });

  it("New Game screen shows Easy, Medium, Hard", () => {
    const html = renderApp({ screen: "difficulty" });
    expect(html).toContain("data-testid=\"diff-easy\"");
    expect(html).toContain("data-testid=\"diff-medium\"");
    expect(html).toContain("data-testid=\"diff-hard\"");
    expect(html).toContain("Easy");
    expect(html).toContain("Medium");
    expect(html).toContain("Hard");
  });

  it("Easy play field mounts a 9×9 board, not the menu", () => {
    const html = renderApp({
      screen: "play",
      difficulty: "easy",
      seed: 11,
    });
    expect(html).toContain("data-testid=\"play-field\"");
    expect(html).toContain("data-testid=\"cell-0-0\"");
    expect(html).toContain("data-testid=\"cell-8-8\"");
    expect(html).not.toContain("data-testid=\"menu-screen\"");
  });
});
