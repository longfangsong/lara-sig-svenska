import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Lära sig svenska");
});

test("Articles link directs to /articles", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Articles");

  await expect(page).toHaveURL("/articles");
});

test("Words link directs to /words", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Words");

  await expect(page).toHaveURL("/words");
});
