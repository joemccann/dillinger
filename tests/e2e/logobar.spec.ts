import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const doc = {
      id: "logobar-test",
      title: "LogoBar Test.md",
      body: "# Test\n\nContent for logobar test.",
      createdAt: "2026-03-10T00:00:00.000Z",
    };
    window.localStorage.setItem("files", JSON.stringify([doc]));
    window.localStorage.setItem("currentDocument", JSON.stringify(doc));
  });
});

test("ads logobar is visible in the footer", async ({ page }) => {
  await page.goto("/");

  const logobar = page.locator("#logobar");
  await expect(logobar).toBeVisible();

  const box = await logobar.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(36);
});

test("ads logobar is anchored at the bottom of the main area", async ({ page }) => {
  await page.goto("/");

  const logobar = page.locator("#logobar");
  await expect(logobar).toBeVisible();

  const viewportSize = page.viewportSize()!;
  const box = await logobar.boundingBox()!;
  expect(box).not.toBeNull();

  // Logobar bottom edge should be at or near the viewport bottom
  const logobarBottom = box!.y + box!.height;
  expect(logobarBottom).toBeGreaterThan(viewportSize.height - 10);
});
