import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";

function renderPlay(): string {
  return renderToString(
    createElement(App, {
      screen: "play",
      difficulty: "easy",
      seed: 11,
      saveStore: null,
    }),
  );
}

describe("play field pad", () => {
  it("shows digits 1–9 on the number pad", () => {
    const html = renderPlay();
    expect(html).toContain('data-testid="digit-pad"');
    for (let digit = 1; digit <= 9; digit++) {
      expect(html).toContain(`data-testid="pad-${digit}"`);
      expect(html).toMatch(new RegExp(`data-testid="pad-${digit}"[^>]*>${digit}<`));
    }
  });

  it("has an erase control on the pad", () => {
    const html = renderPlay();
    expect(html).toContain('data-testid="pad-erase"');
    expect(html).toMatch(/data-testid="pad-erase"[^>]*>Erase</);
  });

  it("HUD shows difficulty, elapsed time, and back-to-menu", () => {
    const html = renderPlay();
    expect(html).toContain('data-testid="play-difficulty"');
    expect(html).toContain("Easy");
    expect(html).toContain('data-testid="play-time"');
    expect(html).toContain("0:00");
    expect(html).toContain('data-testid="play-menu"');
  });

  it("marks givens distinctly from empty player cells", () => {
    const html = renderPlay();
    expect(html).toContain('class="cell cell-given"');
    expect(html).toContain('data-given="true"');
    expect(html).toContain('data-given="false"');
  });
});
