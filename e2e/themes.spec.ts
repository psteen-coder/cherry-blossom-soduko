import { expect, test } from "@playwright/test";

const THEMES = ["Dark", "Light", "Sakura", "Sage", "Lavender", "Peach"];

test("Settings lists exactly the six theme names", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("settings").click();
  await expect(page.getByTestId("settings-screen")).toBeVisible();
  for (const name of THEMES) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-testid^="theme-"]')).toHaveCount(6);
});

test("Choosing Dark sets data-theme and is visible on menu + grid", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("settings").click();
  await page.getByTestId("theme-light").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("theme-dark")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByTestId("settings-back").click();
  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const menuBg = await page.locator("body").evaluate((el) => {
    return getComputedStyle(el).getPropertyValue("--bg").trim();
  });
  expect(menuBg).toBe("#2a1520");
  await page.getByTestId("new-game").click();
  await page.getByTestId("diff-easy").click();
  await expect(page.getByTestId("play-field")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const boardBg = await page.getByTestId("board").evaluate((el) => {
    return getComputedStyle(el).backgroundColor;
  });
  expect(boardBg).toBe("rgb(30, 14, 22)");
});

test("Reload keeps the chosen theme", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("settings").click();
  await page.getByTestId("theme-lavender").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  const stored = await page.evaluate(() =>
    localStorage.getItem("cherry-blossom-soduko:theme"),
  );
  expect(stored).toBe("lavender");
  await page.reload();
  await expect(page.getByTestId("menu-screen")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  const storedAfter = await page.evaluate(() =>
    localStorage.getItem("cherry-blossom-soduko:theme"),
  );
  expect(storedAfter).toBe("lavender");
  await page.getByTestId("settings").click();
  await expect(page.getByTestId("theme-lavender")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
