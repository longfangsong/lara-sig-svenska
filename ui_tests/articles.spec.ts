import { test, expect } from "@playwright/test";

test("can see articles", async ({ page }) => {
  await page.goto("/articles");
  await page.waitForSelector("main ul > li");
  expect(page.locator("main ul > li")).toHaveCount(10);
  const firstArticle = page.locator("main ul > li").first();
  expect(firstArticle).toContainText(
    "Landshövdingen i Stockholm har fått sparken av regeringen",
  );
  await firstArticle.click();
  await page.waitForSelector("main h1");
  expect(page.locator("main h1")).toContainText(
    "Landshövdingen i Stockholm har fått sparken av regeringen",
  );
  const sentences = page.locator("main > div > div");
  expect(await sentences.count()).toBeGreaterThan(2);
  expect(sentences.first()).toContainText(
    "Landshövdingen i Stockholm Anna Kinberg Batra har fått sparken från sitt jobb.",
  );
});
