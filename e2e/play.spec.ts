import { expect, test } from "@playwright/test";

test("pad shows 1–9", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("digit-pad")).toBeVisible();
  for (let digit = 1; digit <= 9; digit++) {
    await expect(page.getByTestId(`pad-${digit}`)).toHaveText(String(digit));
  }
  const padBox = await page.getByTestId("pad-5").boundingBox();
  expect(padBox).toBeTruthy();
  expect(padBox!.height).toBeGreaterThanOrEqual(44);
  expect(padBox!.width).toBeGreaterThanOrEqual(44);
});

test("selecting 5 then tapping an empty cell writes 5", async ({ page }) => {
  await page.goto("/");
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
  await page.getByTestId(cellId!).click();
  await expect(page.getByTestId(cellId!)).toHaveText("5");
});

test("tapping a given cell does not change it", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  const given = page.locator('[data-testid^="cell-"][data-given="true"]').first();
  const before = (await given.textContent()) ?? "";
  expect(before).toMatch(/^[1-9]$/);
  await page.getByTestId("pad-5").click();
  await given.click();
  await expect(given).toHaveText(before);
});

test("erase clears a player cell, not a given", async ({ page }) => {
  await page.goto("/");
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
  await page.getByTestId(cellId!).click();
  await expect(page.getByTestId(cellId!)).toHaveText("5");
  await page.getByTestId("pad-erase").click();
  await page.getByTestId(cellId!).click();
  await expect(page.getByTestId(cellId!)).toHaveText("");
  const given = page.locator('[data-testid^="cell-"][data-given="true"]').first();
  const before = (await given.textContent()) ?? "";
  await given.click();
  await expect(given).toHaveText(before);
});
