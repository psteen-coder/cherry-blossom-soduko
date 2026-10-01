import { expect, test } from "@playwright/test";
import { SudokuGame } from "../src/sudoku/kernel";
import { SAVE_KEY } from "../src/sudoku/save";
import { SCORES_KEY } from "../src/sudoku/scores";

function lastEmpty(game: SudokuGame): { row: number; col: number; digit: number } {
  let last: { row: number; col: number; digit: number } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!game.cell(r, c).given) {
        if (last) {
          const result = game.place(last.row, last.col, last.digit);
          expect(result.ok).toBe(true);
        }
        last = { row: r, col: c, digit: game.solutionAt(r, c) };
      }
    }
  }
  if (!last) throw new Error("no empty cell");
  return last;
}

test("seeded complete shows overlay with elapsed time, petals, and glitter", async ({
  page,
}) => {
  const game = SudokuGame.generate("easy", 11);
  const last = lastEmpty(game);
  const snap = game.snapshot();

  await page.goto("/");
  await page.evaluate(
    ({ saveKey, scoresKey, snap }) => {
      localStorage.clear();
      localStorage.setItem(
        saveKey,
        JSON.stringify({ ...snap, status: "playing" }),
      );
      localStorage.removeItem(scoresKey);
    },
    { saveKey: SAVE_KEY, scoresKey: SCORES_KEY, snap },
  );
  await page.reload();
  await page.getByTestId("continue").click();
  await page.getByTestId(`pad-${last.digit}`).click();
  await page.getByTestId(`cell-${last.row}-${last.col}`).click();

  const overlay = page.getByTestId("win-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute("data-glitter", "true");
  await expect(page.getByTestId("win-time")).toBeVisible();
  await expect(page.getByTestId("win-time")).toHaveText(/^\d+:\d{2}$/);
  expect(await page.getByTestId("win-petal").count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByTestId("name-prompt")).toBeVisible();

  await page.getByTestId("score-name").fill("Pat");
  await page.getByTestId("score-save").click();
  await page.getByTestId("win-leaderboard").click();
  await expect(page.getByTestId("leaderboard-screen")).toBeVisible();
  await expect(page.getByTestId("score-easy-0")).toContainText("Pat");
});

test("slower-than-best win does not glitter", async ({ page }) => {
  const game = SudokuGame.generate("easy", 11);
  const last = lastEmpty(game);
  const snap = { ...game.snapshot(), elapsedSeconds: 120 };

  await page.goto("/");
  await page.evaluate(
    ({ saveKey, scoresKey, snap }) => {
      localStorage.clear();
      localStorage.setItem(
        saveKey,
        JSON.stringify({ ...snap, status: "playing" }),
      );
      localStorage.setItem(
        scoresKey,
        JSON.stringify([
          { name: "Ada", difficulty: "easy", timeSeconds: 1, at: 1 },
        ]),
      );
    },
    { saveKey: SAVE_KEY, scoresKey: SCORES_KEY, snap },
  );
  await page.reload();
  await page.getByTestId("continue").click();
  await page.getByTestId(`pad-${last.digit}`).click();
  await page.getByTestId(`cell-${last.row}-${last.col}`).click();
  await expect(page.getByTestId("win-overlay")).toHaveAttribute(
    "data-glitter",
    "false",
  );
  await expect(page.getByTestId("win-petal").first()).toBeVisible();
  await expect(page.getByTestId("new-high-score")).toHaveCount(0);
});
