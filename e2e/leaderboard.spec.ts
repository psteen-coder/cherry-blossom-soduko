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

test("seeded win records typed name; reload keeps the row; faster time is high score", async ({
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
  await expect(page.getByTestId("continue")).toBeEnabled();
  await page.getByTestId("continue").click();
  await expect(page.getByTestId("play-field")).toBeVisible();
  await page.getByTestId(`pad-${last.digit}`).click();
  await page.getByTestId(`cell-${last.row}-${last.col}`).click();
  await expect(page.getByTestId("name-prompt")).toBeVisible();
  await expect(page.getByTestId("new-high-score")).toBeVisible();
  await page.waitForTimeout(1100);
  await page.getByTestId("score-name").fill("Pat");
  await page.getByTestId("score-save").click();
  await page.getByTestId("win-leaderboard").click();
  await expect(page.getByTestId("leaderboard-screen")).toBeVisible();
  await expect(page.getByTestId("score-easy-0")).toContainText("Pat");

  await page.reload();
  await page.getByTestId("leaderboard").click();
  await expect(page.getByTestId("score-easy-0")).toContainText("Pat");

  const stored = await page.evaluate((key) => localStorage.getItem(key), SCORES_KEY);
  expect(stored).toBeTruthy();
  const rows = JSON.parse(stored!) as Array<{ timeSeconds: number }>;
  expect(rows[0].timeSeconds).toBeGreaterThanOrEqual(0);

  await page.evaluate(
    ({ key, faster }) => {
      const rows = JSON.parse(localStorage.getItem(key) || "[]") as Array<{
        name: string;
        difficulty: string;
        timeSeconds: number;
        at: number;
      }>;
      rows.push({
        name: "Ada",
        difficulty: "easy",
        timeSeconds: faster,
        at: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(rows));
    },
    { key: SCORES_KEY, faster: Math.max(0, rows[0].timeSeconds - 1) },
  );
  await page.reload();
  await page.getByTestId("leaderboard").click();
  await expect(page.getByTestId("score-easy-0")).toContainText("Ada");
  await expect(page.getByTestId("score-easy-1")).toContainText("Pat");
});
