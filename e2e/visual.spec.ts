import { expect, test } from "@playwright/test";

test("visual smoke: blossom menu, 9×9 board, pad 1–9", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Cherry Blossom Soduko");
  await expect(page.getByText("Get started")).toHaveCount(0);
  await expect(page.locator('img[src*="vite"]')).toHaveCount(0);
  await expect(page.locator('img[src*="react"]')).toHaveCount(0);

  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.getByTestId("blossom-border")).toBeVisible();
  await expect(page.getByTestId("blossom-border-top")).toBeVisible();
  await expect(page.getByTestId("blossom-border-bottom")).toBeVisible();
  await expect(page.getByTestId("blossom-border-left")).toBeVisible();
  await expect(page.getByTestId("blossom-border-right")).toBeVisible();

  const menuShot = await page.screenshot({ fullPage: true });
  await testInfo.attach("menu-blossoms.png", {
    body: menuShot,
    contentType: "image/png",
  });

  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.locator("[data-testid^='cell-']")).toHaveCount(81);
  await expect(page.getByTestId("digit-pad")).toBeVisible();
  for (let digit = 1; digit <= 9; digit++) {
    await expect(page.getByTestId(`pad-${digit}`)).toHaveText(String(digit));
  }

  const playShot = await page.getByTestId("play-field").screenshot();
  await testInfo.attach("easy-board-pad.png", {
    body: playShot,
    contentType: "image/png",
  });
});
