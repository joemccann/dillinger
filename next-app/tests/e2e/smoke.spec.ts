import { test, expect } from "@playwright/test";

const seededDocument = {
  id: "playwright-doc",
  title: "Playwright Smoke.md",
  body: "# Playwright Smoke\n\nThis document stabilizes the shell for smoke coverage.",
  createdAt: "2026-03-10T00:00:00.000Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((documentState) => {
    window.localStorage.setItem("files", JSON.stringify([documentState]));
    window.localStorage.setItem("currentDocument", JSON.stringify(documentState));
    window.localStorage.setItem(
      "profileV3",
      JSON.stringify({
        enableAutoSave: true,
        enableWordsCount: true,
        enableCharactersCount: true,
        enableScrollSync: true,
        tabSize: 4,
        keybindings: "default",
        enableNightMode: false,
        enableGitHubComment: true,
      })
    );
  }, seededDocument);
});

test("loads the editor shell and core controls", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 2, name: seededDocument.title })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle sidebar" })).toBeVisible();
  await expect(page.locator("#preview")).toBeVisible();
  await expect(page.getByTestId("word-count")).toContainText("11 words");
  await expect(page.getByTestId("character-count")).toContainText("74 characters");

  await page.getByRole("button", { name: "Hide preview" }).click();
  await expect(page.locator("#preview")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show preview" })).toBeVisible();

  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Night Mode" })).toBeVisible();
});
