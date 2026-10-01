import { expect, test } from "@playwright/test";

test("first paint is the menu titled Cherry Blossom Soduko", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Cherry Blossom Soduko");
  await expect(page.getByRole("heading", { name: "Cherry Blossom Soduko" })).toBeVisible();
  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.getByText("Get started")).toHaveCount(0);
});

test("blossom border art is present on the menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("blossom-border")).toBeVisible();
  await expect(page.getByTestId("blossom-border-top")).toBeVisible();
  await expect(page.getByTestId("blossom-border-bottom")).toBeVisible();
  await expect(page.getByTestId("blossom-border-left")).toBeVisible();
  await expect(page.getByTestId("blossom-border-right")).toBeVisible();
});

test("four menu actions exist; Continue disabled with no save", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("new-game")).toBeVisible();
  await expect(page.getByTestId("continue")).toBeVisible();
  await expect(page.getByTestId("settings")).toBeVisible();
  await expect(page.getByTestId("leaderboard")).toBeVisible();
  await expect(page.getByTestId("continue")).toBeDisabled();
  const box = await page.getByTestId("new-game").boundingBox();
  expect(box).toBeTruthy();
  expect(box!.height).toBeGreaterThanOrEqual(56);
});

test("New Game shows Easy, Medium, Hard then a play field", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("new-game").click();
  await expect(page.getByTestId("diff-easy")).toBeVisible();
  await expect(page.getByTestId("diff-medium")).toBeVisible();
  await expect(page.getByTestId("diff-hard")).toBeVisible();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.locator("[data-testid^='cell-']")).toHaveCount(81);
  await expect(page.getByTestId("menu-screen")).toHaveCount(0);
});
