import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const seededDocument = {
  id: "playwright-doc",
  title: "Playwright Smoke.md",
  body: "# Playwright Smoke\n\nThis document stabilizes the shell for smoke coverage.",
  createdAt: "2026-03-10T00:00:00.000Z",
};

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sotG2UAAAAASUVORK5CYII=",
  "base64"
);

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

test("imports markdown/html files, preserves prior documents, inserts images, and exports html", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("document-import-input").setInputFiles({
    name: "Imported.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Imported\n\nMarkdown body"),
  });

  await expect(
    page.getByRole("heading", { level: 2, name: "Imported.md" })
  ).toBeVisible();
  await expect(page.locator("#preview h1")).toHaveText("Imported");
  await expect(
    page.getByRole("button", { name: /Playwright Smoke\.md/ })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Imported\.md/ })).toBeVisible();

  await page.getByTestId("document-import-input").setInputFiles({
    name: "Imported.html",
    mimeType: "text/html",
    buffer: Buffer.from("<h1>HTML Imported</h1><p>Converted body</p>"),
  });

  await expect(
    page.getByRole("heading", { level: 2, name: "Imported.html" })
  ).toBeVisible();
  await expect(page.locator("#preview h1")).toHaveText("HTML Imported");
  await expect(page.getByRole("button", { name: /Imported\.html/ })).toBeVisible();

  await page.getByTestId("image-import-input").setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: PNG_BYTES,
  });

  await expect(page.locator("#preview img")).toHaveCount(1);

  await page.getByRole("button", { name: "Export document" }).click();
  await expect(
    page.getByRole("menuitem", { name: "HTML", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Styled HTML", exact: true })
  ).toBeVisible();

  const plainDownloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "HTML", exact: true }).click();
  const plainDownload = await plainDownloadPromise;

  expect(plainDownload.suggestedFilename()).toBe("Imported.html");
  const plainHtml = await readFile(await plainDownload.path(), "utf8");
  expect(plainHtml).not.toContain("<style>");

  await page.getByRole("button", { name: "Export document" }).click();
  const styledDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Styled HTML", exact: true })
    .click();
  const styledDownload = await styledDownloadPromise;

  expect(styledDownload.suggestedFilename()).toBe("Imported.html");
  const styledHtml = await readFile(await styledDownload.path(), "utf8");
  expect(styledHtml).toContain("<style>");
  expect(styledHtml).toContain("katex.min.css");
});
