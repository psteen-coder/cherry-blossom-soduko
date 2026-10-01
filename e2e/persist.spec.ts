import { expect, test } from "@playwright/test";

function parseClock(text: string): number {
  const [minutes, seconds] = text.trim().split(":").map(Number);
  return minutes * 60 + seconds;
}

test("cold menu: Continue disabled", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.getByTestId("continue")).toBeDisabled();
});

test("place a digit, reload, Continue restores that digit and timer ≥ prior", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("pad-5").click();
  await expect(page.getByTestId("pad-5")).toHaveAttribute("aria-pressed", "true");
  const empty = page
    .locator('[data-testid^="cell-"][data-given="false"]')
    .filter({ hasText: /^$/ })
    .first();
  const cellId = await empty.getAttribute("data-testid");
  expect(cellId).toBeTruthy();
  await page.getByTestId(cellId!).click();
  await expect(page.getByTestId(cellId!)).toHaveText("5");
  await page.waitForTimeout(1500);
  const prior = parseClock(await page.getByTestId("play-time").innerText());
  await page.reload();
  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.getByTestId("continue")).toBeEnabled();
  await page.getByTestId("continue").click();
  await expect(page.getByTestId("play-field")).toBeVisible();
  await expect(page.getByTestId(cellId!)).toHaveText("5");
  const restored = parseClock(await page.getByTestId("play-time").innerText());
  expect(restored).toBeGreaterThanOrEqual(prior);
});

test("New Game disables Continue until a new place happens", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("pad-5").click();
  await expect(page.getByTestId("pad-5")).toHaveAttribute("aria-pressed", "true");
  const firstEmpty = page
    .locator('[data-testid^="cell-"][data-given="false"]')
    .filter({ hasText: /^$/ })
    .first();
  const firstId = await firstEmpty.getAttribute("data-testid");
  await page.getByTestId(firstId!).click();
  await page.getByTestId("play-menu").click();
  await expect(page.getByTestId("continue")).toBeEnabled();
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-back").click();
  await expect(page.getByTestId("continue")).toBeDisabled();
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("play-menu").click();
  await expect(page.getByTestId("continue")).toBeDisabled();
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("pad-3").click();
  await expect(page.getByTestId("pad-3")).toHaveAttribute("aria-pressed", "true");
  const secondEmpty = page
    .locator('[data-testid^="cell-"][data-given="false"]')
    .filter({ hasText: /^$/ })
    .first();
  const secondId = await secondEmpty.getAttribute("data-testid");
  await page.getByTestId(secondId!).click();
  await page.getByTestId("play-menu").click();
  await expect(page.getByTestId("continue")).toBeEnabled();
});
